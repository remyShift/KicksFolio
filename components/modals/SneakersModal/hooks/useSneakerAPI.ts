import { Sneaker } from '@/types/Sneaker';
import {
	SupabaseSneakerService,
	SupabaseSneaker,
} from '@/services/SneakersService';
import { SneakerFormData } from '../types';
import { ModalStep } from '../types';
import { FetchedSneaker } from '@/store/useModalStore';
import { useSession } from '@/context/authContext';
import { sneakerSchema } from '@/validation/schemas';
import { ZodIssue } from 'zod';

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
		image: {
			original: string;
		};
	}>;
}

export const useSneakerAPI = (userId: string) => {
	const { refreshUserSneakers, userSneakers, user } = useSession();

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
						brand: responseResult.brand.toLowerCase() || '',
						description: responseResult.story || '',
						image: {
							url: responseResult.image.original || '',
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
			status: supabaseSneaker.status,
			images: supabaseSneaker.images,
			price_paid: supabaseSneaker.price_paid || 0,
			description: supabaseSneaker.description || '',
			created_at: supabaseSneaker.created_at,
			updated_at: supabaseSneaker.updated_at,
			collection_id: supabaseSneaker.collection_id,
		};
	};

	const handleFormSubmit = async (
		formData: SneakerFormData,
		callbacks?: Callbacks,
		collectionId?: string
	) => {
		if (!user) {
			callbacks?.setErrorMsg('No session token');
			return Promise.reject('No session token');
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
					images: formData.images.map((img) => ({
						id: '',
						url: img.url,
					})),
					price_paid: formData.price_paid
						? parseFloat(formData.price_paid.toString())
						: undefined,
					description: formData.description,
					collection_id: collectionId,
				};

				return SupabaseSneakerService.createSneaker(sneakerToAdd);
			})
			.then((response: SupabaseSneaker) => {
				if (response && callbacks) {
					const convertedSneaker =
						convertSupabaseSneakerToSneaker(response);
					callbacks.setCurrentSneaker?.(convertedSneaker);
					callbacks.setModalStep('view');

					setTimeout(() => {
						refreshUserSneakers();
					}, 100);
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

				const sneakerUpdates: Partial<SupabaseSneaker> = {
					model: formData.model,
					brand: formData.brand,
					status: formData.status,
					size: parseInt(formData.size.toString()),
					condition: parseInt(formData.condition.toString()),
					images: formData.images.map((img) => ({
						id: '',
						url: img.url,
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

					setTimeout(() => {
						refreshUserSneakers();
					}, 100);
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
			.then(() => {
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
