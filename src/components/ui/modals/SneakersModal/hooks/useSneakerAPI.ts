import { useTranslation } from 'react-i18next';

import { ZodIssue } from 'zod';

import { useSession } from '@/contexts/authContext';
import { ImageStorage } from '@/domain/ImageStorage';
import { SneakerHandler } from '@/domain/SneakerHandler';
import useToast from '@/hooks/ui/useToast';
import { FetchedSneaker } from '@/store/useModalStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { imageStorageProxy } from '@/tech/proxy/ImageProxy';
import { sneakerProxy } from '@/tech/proxy/SneakerProxy';
import { SneakerPhoto } from '@/types/image';
import { Sneaker } from '@/types/sneaker';
import {
	createSneakerSchema,
	SneakerFormData,
	ValidatedSneakerData,
} from '@/validation/sneaker';

import { ModalStep } from '../types';

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
	const { currentUnit } = useSizeUnitStore();

	const imageHandler = new ImageStorage(imageStorageProxy);
	const sneakerHandler = new SneakerHandler(sneakerProxy);

	const validateSneakerData = (formData: SneakerFormData) => {
		return new Promise<{
			isValid: boolean;
			errors: { [key: string]: string };
			validatedData?: ValidatedSneakerData;
		}>((resolve) => {
			const validationData = {
				images: formData.images,
				model: formData.model,
				brand_id: formData.brand_id,
				status_id: formData.status_id,
				size: formData.size.toString(),
				condition: formData.condition.toString(),
				price_paid: formData.price_paid || undefined,
				description: formData.description || undefined,
				og_box: formData.og_box || false,
				ds: formData.ds || false,
				is_women: formData.is_women || false,
			};

			const parseResult = createSneakerSchema().safeParse(validationData);

			if (parseResult.success) {
				resolve({
					isValid: true,
					errors: {},
					validatedData: parseResult.data,
				});
			} else {
				const errors: {
					[key: string]: string;
				} = {};
				parseResult.error.errors.forEach((err: ZodIssue) => {
					const field = err.path[0];
					errors[field] = err.message;
				});
				resolve({
					isValid: false,
					errors,
				});
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

		return sneakerHandler
			.searchBySku(sku.trim())
			.then((response: SkuSearchResponse) => {
				if (
					response &&
					response.results &&
					response.results.length > 0
				) {
					const responseResult = response.results[0];

					const transformedSneaker: FetchedSneaker = {
						model: responseResult.title || '',
						brand: responseResult.brand || 'Other',
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

	const handleAddSneaker = async (
		formData: SneakerFormData,
		callbacks?: Callbacks,
		estimatedValue?: number | null,
		gender?: string | null,
		sku?: string | null,
		fetchedImage?: string | null
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

				const validatedData = validationResult.validatedData!;

				const sneakerToAdd: Omit<
					Sneaker,
					'id' | 'user_id' | 'size_eu' | 'size_us'
				> & { size: number; fetchedImage?: string } = {
					model: validatedData.model,
					brand_id: validatedData.brand_id,
					status_id: validatedData.status_id,
					size: parseFloat(validatedData.size),
					condition: parseInt(validatedData.condition),
					images: [],
					price_paid: validatedData.price_paid
						? parseFloat(validatedData.price_paid)
						: undefined,
					description: validatedData.description || '',
					estimated_value: estimatedValue || 0,
					gender: formData.is_women ? 'women' : 'men',
					sku: sku || '',
					og_box: validatedData.og_box || false,
					ds: validatedData.ds || false,
					fetchedImage: fetchedImage || undefined,
				};

				return imageHandler
					.processAndUploadSneaker(
						formData.images.map((img) => ({
							uri: img.uri,
							id: img.id,
						})),
						user.id,
						'temp'
					)
					.then((processedImages: SneakerPhoto[]) => {
						if (processedImages.length === 0) {
							throw new Error(
								'Image processing returned no images'
							);
						}

						const sneakerWithImages = {
							...sneakerToAdd,
							images: processedImages.map((img) => ({
								id: img.id,
								uri: img.uri,
							})),
						};

						return sneakerHandler.create(
							sneakerWithImages,
							currentUnit
						);
					});
			})
			.then((response: Sneaker) => {
				if (response && callbacks) {
					const sneakerWithAltText = {
						...response,
						images: response.images.map((img, index) => ({
							...img,
							alt:
								img.alt ||
								`${response.model} image ${index + 1}`,
						})),
					};

					callbacks.setCurrentSneaker?.(sneakerWithAltText);
					callbacks.setModalStep('view');
					refreshUserSneakers().then(() => {
						console.log('sneaker added', sneakerWithAltText);
						showSuccessToast(
							`➕ ${sneakerWithAltText.model} ${t(
								'collection.modal.form.success.added'
							)}`,
							t('collection.modal.form.success.addedDescription')
						);
					});
				}
				return response;
			})
			.catch((error: Error) => {
				console.error('❌ handleAddSneaker error:', error);
				callbacks?.setErrorMsg?.(
					error.message || 'Failed to add sneaker'
				);
				showErrorToast(
					t('collection.modal.form.errors.sneaker.error'),
					t('collection.modal.form.errors.sneaker.errorDescription')
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

				const validatedData = validationResult.validatedData!;

				const processedImages =
					await imageHandler.processAndUploadSneaker(
						formData.images.map((img) => ({
							uri: img.uri,
							id: img.id,
						})),
						user.id,
						sneakerId
					);

				const sneakerUpdates: Partial<
					Sneaker & {
						size?: number;
					}
				> = {
					model: validatedData.model,
					brand_id: validatedData.brand_id,
					status_id: validatedData.status_id,
					size: parseFloat(validatedData.size),
					condition: parseInt(validatedData.condition),
					images: processedImages.map((img) => ({
						id: img.id,
						uri: img.uri,
					})),
					price_paid: validatedData.price_paid
						? parseFloat(validatedData.price_paid)
						: undefined,
					description: validatedData.description,
					gender: formData.is_women ? 'women' : 'men',
					og_box: validatedData.og_box || false,
					ds: validatedData.ds || false,
				};

				return sneakerHandler.update(
					sneakerId,
					sneakerUpdates,
					currentUnit
				);
			})
			.then((response: Sneaker) => {
				if (response && callbacks) {
					const sneakerWithAltText = {
						...response,
						images: response.images.map((img, index) => ({
							...img,
							alt:
								img.alt ||
								`${response.model} image ${index + 1}`,
						})),
					};

					callbacks.setCurrentSneaker?.(sneakerWithAltText);
					callbacks.setModalStep('view');
					refreshUserSneakers().then(() => {
						showSuccessToast(
							`♻️ ${sneakerWithAltText.model} ${t(
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

		return sneakerHandler
			.delete(sneakerId)
			.then(async () => {
				await imageHandler.deleteSneaker(user.id, sneakerId);

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

		return sneakerHandler
			.searchByBarcode(barcode.trim())
			.then((response: SkuSearchResponse) => {
				if (
					response &&
					response.results &&
					response.results.length > 0
				) {
					const responseResult = response.results[0];

					const transformedSneaker: FetchedSneaker = {
						model: responseResult.title || '',
						brand: responseResult.brand || 'Other',
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
