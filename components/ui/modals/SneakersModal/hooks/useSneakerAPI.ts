import { Sneaker, Photo, SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import {
	SupabaseSneakerService,
	SupabaseSneaker,
} from '@/services/SneakersService';
import {
	SneakerFormData,
	createSneakerSchema,
	sneakerBrandOptions,
} from '@/validation/schemas';
import { ModalStep } from '../types';
import { FetchedSneaker } from '@/store/useModalStore';
import { useSession } from '@/context/authContext';
import { ZodIssue } from 'zod';
import SupabaseImageService from '@/services/SupabaseImageService';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

interface Callbacks {
	setCurrentSneaker?: (sneaker: Sneaker | null) => void;
	setFetchedSneaker?: (sneaker: FetchedSneaker | null) => void;
	setModalStep: (step: ModalStep) => void;
	setErrorMsg: (error: string) => void;
}

interface SkuSearchResponse {
	results: Array<{
		title: string;
		brand: string;
		description: string;
		gender: string;
		gallery: string[];
		avg_price: number;
		sku: string;
	}>;
}

export const useSneakerAPI = () => {
	const { refreshUserSneakers, userSneakers, user } = useSession();
	const { showSuccessToast, showErrorToast } = useToast();
	const { t } = useTranslation();
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
				og_box: formData.og_box || false,
				ds: formData.ds || false,
			};

			const parseResult = createSneakerSchema().safeParse(validationData);

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
			callbacks.setErrorMsg(
				t('collection.modal.form.errors.sku.required')
			);
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

					const sneakerBrand = sneakerBrandOptions.find(
						(brand) =>
							brand.value.toLowerCase() ===
							responseResult.brand.toLowerCase()
					);

					const transformedSneaker: FetchedSneaker = {
						model: responseResult.title || '',
						brand: sneakerBrand?.value || SneakerBrand.Other,
						sku: sku.toUpperCase(),
						description: responseResult.description || '',
						gender: responseResult.gender || '',
						estimated_value: responseResult.avg_price || 0,
						image: {
							uri: responseResult.gallery[0] || '',
						},
					};
					callbacks.setFetchedSneaker?.(transformedSneaker);
					callbacks.setModalStep('addFormImages');
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
			sku: supabaseSneaker.sku || '',
			gender: supabaseSneaker.gender || '',
			brand: supabaseSneaker.brand,
			model: supabaseSneaker.model,
			size_eu: supabaseSneaker.size_eu,
			size_us: supabaseSneaker.size_us,
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
			og_box: supabaseSneaker.og_box || false,
			ds: supabaseSneaker.ds || false,
			created_at: supabaseSneaker.created_at,
			updated_at: supabaseSneaker.updated_at,
			user_id: supabaseSneaker.user_id,
			estimated_value: supabaseSneaker.estimated_value || 0,
		};
	};

	const handleAddSneaker = async (
		formData: SneakerFormData,
		callbacks?: Callbacks,
		estimatedValue?: number | null,
		gender?: string | null,
		sku?: string | null
	) => {
		if (!user) {
			callbacks?.setErrorMsg(
				t('collection.modal.form.errors.user.required')
			);
			return Promise.reject('No user authenticated');
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
					| 'id'
					| 'created_at'
					| 'updated_at'
					| 'user_id'
					| 'size_eu'
					| 'size_us'
				> & { size: number } = {
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
					estimated_value: estimatedValue || 0,
					gender: gender as 'men' | 'women' | undefined,
					sku: sku || undefined,
					og_box: formData.og_box || false,
					ds: formData.ds || false,
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
						console.log('sneaker added', convertedSneaker);
						showSuccessToast(
							`➕ ${convertedSneaker.model} ${t(
								'collection.modal.form.success.added'
							)}`,
							t('collection.modal.form.success.addedDescription')
						);
					});
				}
				return response;
			})
			.catch((error: Error) => {
				showErrorToast(
					t('collection.modal.form.errors.sneaker.error'),
					t('collection.modal.form.errors.sneaker.errorDescription')
				);
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

				const sneakerUpdates: Partial<
					SupabaseSneaker & { size?: number }
				> = {
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
					og_box: formData.og_box || false,
					ds: formData.ds || false,
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
							`♻️ ${convertedSneaker.model} ${t(
								'collection.modal.form.success.updated'
							)}`,
							t(
								'collection.modal.form.success.updatedDescription'
							)
						);
					});
				} else {
					console.error('No response or callbacks');
				}
				return response;
			})
			.catch((error: Error) => {
				showErrorToast(
					t('collection.modal.form.errors.sneaker.error'),
					t('collection.modal.form.errors.sneaker.errorDescription')
				);
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

	const handleBarcodeSearch = async (
		barcode: string,
		callbacks: Callbacks
	) => {
		if (!user) {
			callbacks.setErrorMsg('Session expired. Please login again.');
			return Promise.resolve();
		}

		if (!barcode.trim()) {
			callbacks.setErrorMsg(
				t('collection.modal.form.errors.barcode.required')
			);
			return Promise.resolve();
		}

		callbacks.setErrorMsg('');

		return SupabaseSneakerService.searchByBarcode(barcode.trim())
			.then((response: SkuSearchResponse) => {
				if (
					response &&
					response.results &&
					response.results.length > 0
				) {
					const responseResult = response.results[0];

					const sneakerBrand = sneakerBrandOptions.find(
						(brand) =>
							brand.value.toLowerCase() ===
							responseResult.brand.toLowerCase()
					);

					const transformedSneaker: FetchedSneaker = {
						model: responseResult.title || '',
						brand: sneakerBrand?.value || SneakerBrand.Other,
						sku: responseResult.sku.toUpperCase(),
						description: responseResult.description || '',
						gender: responseResult.gender || '',
						estimated_value: responseResult.avg_price || 0,
						image: {
							uri: responseResult.gallery[0] || '',
						},
					};
					callbacks.setFetchedSneaker?.(transformedSneaker);
					callbacks.setModalStep('addFormImages');
				}
				return response;
			})
			.catch((error: Error) => {
				callbacks.setErrorMsg(
					error.message || 'An error occurred during barcode search'
				);
				throw error;
			});
	};

	return {
		handleSkuSearch,
		handleBarcodeSearch,
		handleAddSneaker,
		handleFormUpdate,
		handleNext,
		handlePrevious,
		handleSneakerDelete,
	};
};
