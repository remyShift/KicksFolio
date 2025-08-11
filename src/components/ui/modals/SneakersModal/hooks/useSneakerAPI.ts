import { useTranslation } from 'react-i18next';

import { ZodIssue } from 'zod';

import { useSession } from '@/contexts/authContext';
import { sneakerProvider } from '@/d/SneakerProvider';
import { ImageHandler } from '@/domain/ImageHandler';
import { SneakerInterface } from '@/domain/SneakerProviderInterface';
import useToast from '@/hooks/ui/useToast';
import { FetchedSneaker } from '@/store/useModalStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { imageProxy } from '@/tech/proxy/ImageProxy';
import { SneakerPhoto } from '@/types/image';
import { Sneaker, SneakerBrand } from '@/types/sneaker';
import { createSneakerSchema, SneakerFormData } from '@/validation/sneaker';
import { sneakerBrandOptions } from '@/validation/utils';

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

	const imageHandler = new ImageHandler(imageProxy);

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
				is_women: formData.is_women || false,
			};

			const parseResult = createSneakerSchema().safeParse(validationData);

			if (parseResult.success) {
				resolve({
					isValid: true,
					errors: {},
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

		return SneakerInterface.searchBySku(
			sku.trim(),
			sneakerProvider.searchBySku
		)
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

				const validatedData = createSneakerSchema().parse({
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
					is_women: formData.is_women || false,
				});

				const sneakerToAdd: Omit<
					Sneaker,
					'id' | 'user_id' | 'size_eu' | 'size_us'
				> & { size: number } = {
					model: validatedData.model,
					brand: validatedData.brand,
					status: validatedData.status,
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
				};

				return SneakerInterface.createSneaker(
					sneakerToAdd,
					currentUnit,
					sneakerProvider.createSneaker
				);
			})
			.then(async (createdSneaker: Sneaker) => {
				return imageHandler
					.processAndUploadSneakerImages(
						formData.images.map((img) => ({
							uri: img.uri,
							id: img.id,
						})),
						user.id,
						createdSneaker.id
					)
					.then((processedImages: SneakerPhoto[]) => {
						if (processedImages.length > 0) {
							return SneakerInterface.updateSneaker(
								createdSneaker.id,
								{
									images: processedImages.map((img) => ({
										id: img.id,
										uri: img.uri,
									})),
								},
								currentUnit,
								sneakerProvider.updateSneaker
							);
						}

						return SneakerInterface.deleteSneaker(
							createdSneaker.id,
							sneakerProvider.deleteSneaker
						).then(() => {
							return Promise.reject(
								new Error(
									'Image processing returned no images; creation rolled back'
								)
							);
						});
					})
					.catch((error: Error) => {
						return SneakerInterface.deleteSneaker(
							createdSneaker.id,
							sneakerProvider.deleteSneaker
						).then(() => {
							throw error;
						});
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
				console.error('error', error);
				showErrorToast(
					t('collection.modal.form.errors.sneaker.error'),
					t('collection.modal.form.errors.sneaker.errorDescription')
				);
				callbacks?.setErrorMsg(
					`An error occurred while submitting the sneaker: ${error}`
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

				const validatedData = createSneakerSchema().parse({
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
					is_women: formData.is_women || false,
				});

				const processedImages =
					await imageHandler.processAndUploadSneakerImages(
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
					brand: validatedData.brand,
					status: validatedData.status,
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

				return SneakerInterface.updateSneaker(
					sneakerId,
					sneakerUpdates,
					currentUnit,
					sneakerProvider.updateSneaker
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

		return SneakerInterface.deleteSneaker(
			sneakerId,
			sneakerProvider.deleteSneaker
		)
			.then(async () => {
				await imageHandler.deleteSneakerImages(user.id, sneakerId);

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

		return SneakerInterface.searchByBarcode(
			barcode.trim(),
			sneakerProvider.searchByBarcode
		)
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
