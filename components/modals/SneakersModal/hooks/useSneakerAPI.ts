import { Sneaker, Photo, SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import {
	SupabaseSneakerService,
	SupabaseSneaker,
} from '@/services/SneakersService';
import { SneakerFormData } from '@/validation/schemas';
import { ModalStep } from '../types';
import { FetchedSneaker } from '@/store/useModalStore';
import { useSession } from '@/context/authContext';
import { sneakerSchema } from '@/validation/schemas';
import { ZodIssue } from 'zod';
import SupabaseImageService from '@/services/SupabaseImageService';
import useToast from '@/hooks/useToast';

interface Callbacks {
	setCurrentSneaker?: (sneaker: Sneaker | null) => void;
	setFetchedSneaker?: (sneaker: FetchedSneaker | null) => void;
	setModalStep: (step: ModalStep) => void;
	setErrorMsg: (error: string) => void;
}

interface SkuSearchResponse {
	results: Array<{
		name: string;
		brand: string;
		story: string;
		estimatedMarketValue: number;
		image: {
			original: string;
		};
	}>;
}

export const useSneakerAPI = (userId: string) => {
	const { refreshUserSneakers, userSneakers, user } = useSession();
	const { showSuccessToast } = useToast();

	const validateSneakerData = (formData: SneakerFormData) => {
		return new Promise<{
			isValid: boolean;
			errors: { [key: string]: string };
		}>((resolve) => {
			const validationData = {
				images: formData.images,
				model: formData.model,
				brand: formData.brand,
				status: formData.status,
				size: formData.size.toString(),
				condition: formData.condition.toString(),
				price_paid: formData.price_paid || undefined,
				description: formData.description || undefined,
			};

			const parseResult = sneakerSchema.safeParse(validationData);

			if (parseResult.success) {
				resolve({ isValid: true, errors: {} });
			} else {
				const errors: { [key: string]: string } = {};
				parseResult.error.errors.forEach((err: ZodIssue) => {
					const field = err.path[0];
					errors[field] = err.message;
				});
				resolve({ isValid: false, errors });
			}
		});
	};

	const handleSkuSearch = async (sku: string, callbacks: Callbacks) => {
		if (!user) {
			callbacks.setErrorMsg('Session expired. Please login again.');
			return Promise.resolve();
		}

		if (!sku.trim()) {
			callbacks.setErrorMsg('Please enter a SKU.');
			return Promise.resolve();
		}

		callbacks.setErrorMsg('');

		return SupabaseSneakerService.searchBySku(sku.trim())
			.then((response: SkuSearchResponse) => {
				if (
					response &&
					response.results &&
					response.results.length > 0
				) {
					const responseResult = response.results[0];

					const transformedSneaker: FetchedSneaker = {
						model: responseResult.name || '',
						brand: responseResult.brand.toLowerCase() as SneakerBrand,
						description: responseResult.story || '',
						estimated_value:
							responseResult.estimatedMarketValue || 0,
						image: {
							uri: responseResult.image.original || '',
						},
					};
					callbacks.setFetchedSneaker?.(transformedSneaker);
					callbacks.setModalStep('addForm');
				}
				return response;
			})
			.catch((error: Error) => {
				callbacks.setErrorMsg(
					error.message || 'An error occurred during SKU search'
				);
				throw error;
			});
	};

	const convertSupabaseSneakerToSneaker = (
		supabaseSneaker: SupabaseSneaker
	): Sneaker => {
		return {
			id: supabaseSneaker.id,
			brand: supabaseSneaker.brand,
			model: supabaseSneaker.model,
			size: supabaseSneaker.size,
			condition: supabaseSneaker.condition,
			status: supabaseSneaker.status as SneakerStatus,
			images: supabaseSneaker.images.map((img, index) => {
				const fileNameFromUrl =
					SupabaseImageService.extractFilePathFromUrl(
						img.uri,
						'sneakers'
					);
				return {
					id: img.id || fileNameFromUrl || '',
					uri: img.uri || '',
					alt: `${supabaseSneaker.model} image ${index + 1}`,
				};
			}),
			price_paid: supabaseSneaker.price_paid || 0,
			description: supabaseSneaker.description || '',
			created_at: supabaseSneaker.created_at,
			updated_at: supabaseSneaker.updated_at,
			collection_id: supabaseSneaker.collection_id,
			estimated_value: supabaseSneaker.estimated_value || 0,
		};
	};

	const handleFormSubmit = async (
		formData: SneakerFormData,
		callbacks?: Callbacks,
		collectionId?: string,
		estimatedValue?: number | null
	) => {
		if (!user) {
			callbacks?.setErrorMsg('No user authenticated');
			return Promise.reject('No user authenticated');
		}

		if (!collectionId) {
			callbacks?.setErrorMsg('No collection ID provided');
			return Promise.reject('No collection ID provided');
		}

		return validateSneakerData(formData)
			.then((validationResult) => {
				if (!validationResult.isValid) {
					const firstError = Object.values(
						validationResult.errors
					)[0];
					callbacks?.setErrorMsg(
						(firstError as string) || 'Validation failed'
					);
					return Promise.reject('Validation failed');
				}

				const sneakerToAdd: Omit<
					SupabaseSneaker,
					'id' | 'created_at' | 'updated_at'
				> = {
					model: formData.model,
					brand: formData.brand,
					status: formData.status,
					size: parseInt(formData.size.toString()),
					condition: parseInt(formData.condition.toString()),
					images: [],
					price_paid: formData.price_paid
						? parseFloat(formData.price_paid.toString())
						: undefined,
					description: formData.description,
					collection_id: collectionId,
					estimated_value: estimatedValue || undefined,
				};

				return SupabaseSneakerService.createSneaker(sneakerToAdd);
			})
			.then(async (createdSneaker: SupabaseSneaker) => {
				const processedImages =
					await SupabaseImageService.processAndUploadSneakerImages(
						formData.images.map((img) => ({
							uri: img.uri,
							id: img.id,
						})),
						user.id,
						createdSneaker.id
					);

				if (processedImages.length > 0) {
					const updatedSneaker =
						await SupabaseSneakerService.updateSneaker(
							createdSneaker.id,
							{
								images: processedImages.map((img) => ({
									id: img.id,
									uri: img.uri,
								})),
							}
						);
					return updatedSneaker;
				}

				return createdSneaker;
			})
			.then((response: SupabaseSneaker) => {
				if (response && callbacks) {
					const convertedSneaker =
						convertSupabaseSneakerToSneaker(response);
					callbacks.setCurrentSneaker?.(convertedSneaker);
					callbacks.setModalStep('view');
					refreshUserSneakers().then(() => {
						showSuccessToast(
							`➕ ${convertedSneaker.model} added`,
							'The sneaker has been added successfully.'
						);
					});
				}
				return response;
			})
			.catch((error: Error) => {
				callbacks?.setErrorMsg(
					`An error occurred while submitting the sneaker: ${error.message}`
				);
				throw error;
			});
	};

	const handleFormUpdate = async (
		sneakerId: string,
		formData: SneakerFormData,
		callbacks?: Callbacks
	) => {
		if (!user) {
			callbacks?.setErrorMsg('No session token');
			return Promise.reject('No session token');
		}

		return validateSneakerData(formData)
			.then(async (validationResult) => {
				if (!validationResult.isValid) {
					const firstError = Object.values(
						validationResult.errors
					)[0];
					callbacks?.setErrorMsg(
						(firstError as string) || 'Validation failed'
					);
					return Promise.reject('Validation failed');
				}

				const processedImages =
					await SupabaseImageService.processAndUploadSneakerImages(
						formData.images.map((img) => ({
							uri: img.uri,
							id: img.id,
						})),
						user.id,
						sneakerId
					);

				const sneakerUpdates: Partial<SupabaseSneaker> = {
					model: formData.model,
					brand: formData.brand,
					status: formData.status,
					size: parseInt(formData.size.toString()),
					condition: parseInt(formData.condition.toString()),
					images: processedImages.map((img) => ({
						id: img.id,
						uri: img.uri,
					})),
					price_paid: formData.price_paid
						? parseFloat(formData.price_paid.toString())
						: undefined,
					description: formData.description,
				};

				return SupabaseSneakerService.updateSneaker(
					sneakerId,
					sneakerUpdates
				);
			})
			.then((response: SupabaseSneaker) => {
				if (response && callbacks) {
					const convertedSneaker =
						convertSupabaseSneakerToSneaker(response);
					callbacks.setCurrentSneaker?.(convertedSneaker);
					callbacks.setModalStep('view');
					refreshUserSneakers().then(() => {
						showSuccessToast(
							`♻️ ${convertedSneaker.model} updated`,
							'The sneaker has been updated successfully.'
						);
					});
				} else {
					console.error('No response or callbacks');
				}
				return response;
			})
			.catch((error: Error) => {
				callbacks?.setErrorMsg(
					`An error occurred while updating the sneaker: ${error.message}`
				);
				throw error;
			});
	};

	const handleNext = (
		nextSneaker: Sneaker | null,
		setCurrentSneaker: (sneaker: Sneaker | null) => void
	) => {
		if (!userSneakers || !nextSneaker?.id) return;

		if (!nextSneaker) {
			return;
		}
		setCurrentSneaker(nextSneaker);
	};

	const handlePrevious = (
		prevSneaker: Sneaker | null,
		setCurrentSneaker: (sneaker: Sneaker | null) => void
	) => {
		if (!userSneakers || !prevSneaker?.id) return;

		if (!prevSneaker) {
			return;
		}
		setCurrentSneaker(prevSneaker);
	};

	const handleSneakerDelete = async (sneakerId: string) => {
		if (!user) {
			return Promise.reject('No session token');
		}

		return SupabaseSneakerService.deleteSneaker(sneakerId)
			.then(async () => {
				await SupabaseImageService.deleteSneakerImages(
					user.id,
					sneakerId
				);

				return refreshUserSneakers();
			})
			.then(() => {
				return { success: true };
			})
			.catch((error: Error) => {
				throw error;
			});
	};

	return {
		handleSkuSearch,
		handleFormSubmit,
		handleFormUpdate,
		handleNext,
		handlePrevious,
		handleSneakerDelete,
	};
};
