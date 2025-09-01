import { useTranslation } from 'react-i18next';

import { ZodIssue } from 'zod';

import { useSession } from '@/contexts/authContext';
import { ImageStorage } from '@/domain/ImageStorage';
import { SneakerHandler } from '@/domain/SneakerHandler';
import useToast from '@/hooks/ui/useToast';
import { useNotifications } from '@/hooks/useNotifications';
import { FetchedSneaker } from '@/store/useModalStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { imageStorageProxy } from '@/tech/proxy/ImageProxy';
import { sneakerProxy } from '@/tech/proxy/SneakerProxy';
import { SneakerPhoto } from '@/types/image';
import { NotificationType } from '@/types/notification';
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
	const { sendNotificationToFollowers } = useNotifications();

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
				if (error.message.includes('Aucune donnée trouvée')) {
					callbacks.setErrorMsg(
						t('collection.modal.form.errors.sku.notFound') ||
							'No data found for this SKU'
					);
				} else {
					callbacks.setErrorMsg(
						error.message || 'An error occurred during SKU search'
					);
				}
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
					gender: gender || (formData.is_women ? 'women' : 'men'),
					sku: sku || '',
					og_box: validatedData.og_box || false,
					ds: validatedData.ds || false,
					fetchedImage: fetchedImage || undefined,
				};

				return sneakerHandler
					.create(sneakerToAdd, currentUnit)
					.then((createdSneaker: Sneaker) => {
						const personalImages = formData.images.filter(
							(img) => img.uri !== fetchedImage
						);

						if (personalImages.length > 0) {
							return imageHandler
								.processAndUploadSneaker(
									personalImages.map((img) => ({
										uri: img.uri,
										id: img.id,
									})),
									user.id,
									createdSneaker.id
								)
								.then((processedImages: SneakerPhoto[]) => {
									return sneakerHandler.update(
										createdSneaker.id,
										{
											images: processedImages.map(
												(img) => ({
													id: img.id,
													uri: img.uri,
													type: 'personal',
												})
											),
										},
										currentUnit
									);
								});
						} else {
							return createdSneaker;
						}
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
						showSuccessToast(
							`➕ ${sneakerWithAltText.model} ${t(
								'collection.modal.form.success.added'
							)}`,
							t('collection.modal.form.success.addedDescription')
						);

						if (user?.id && sneakerWithAltText.id) {
							sendNotificationToFollowers(
								user.id,
								NotificationType.SINGLE_SNEAKER_ADDED,
								{
									type: NotificationType.SINGLE_SNEAKER_ADDED,
									sneaker: {
										id: sneakerWithAltText.id,
										model: sneakerWithAltText.model,
										brand_name: 'Unknown',
										image: sneakerWithAltText.images?.[0]
											?.uri,
									},
									user_id: user.id,
									username: user.username || '',
									user_avatar: user.profile_picture,
								}
							).catch((error) => {
								console.warn(
									'Failed to send notifications:',
									error
								);
							});
						}
					});
				}
				return response;
			})
			.catch((error) => {
				console.error('❌ handleAddSneaker error:', error);

				let errorMessage = 'Failed to add sneaker';

				if (typeof error === 'string') {
					errorMessage = error;
				} else if (error?.message) {
					errorMessage = error.message;
				} else if (error?.details) {
					errorMessage = error.details;
				} else if (error?.hint) {
					errorMessage = error.hint;
				} else if (error?.code) {
					const pgErrors: { [key: string]: string } = {
						'42703':
							'Erreur de configuration de la base de données',
						'23505': 'Cette sneaker existe déjà',
						'23503': 'Données manquantes ou invalides',
						'42P01': 'Erreur de structure de base de données',
						PGRST116: "Erreur lors de la sauvegarde de l'image",
					};
					errorMessage =
						pgErrors[error.code] ||
						`Erreur de base de données (${error.code})`;
				} else if (typeof error === 'object') {
					errorMessage =
						"Une erreur inattendue est survenue lors de l'ajout de la sneaker";
				}

				callbacks?.setErrorMsg?.(errorMessage);
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

				const referenceImageUri =
					await sneakerHandler.getReferenceImage(sneakerId);

				const personalImages = formData.images.filter(
					(img) => img.uri !== referenceImageUri
				);

				const processedImages =
					personalImages.length > 0
						? await imageHandler.processAndUploadSneaker(
								personalImages.map((img) => ({
									uri: img.uri,
									id: img.id,
								})),
								user.id,
								sneakerId
							)
						: [];

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
						type: 'personal',
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

	const handleSneakerDelete = async (collectionId: string) => {
		if (!user) {
			return Promise.reject('No session token');
		}

		return sneakerHandler
			.delete(collectionId)
			.then(async () => {
				await imageHandler.deleteSneaker(user.id, collectionId);
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
				if (
					error.message.includes('No data found for this barcode') ||
					error.message.includes('Aucune donnée trouvée')
				) {
					const errorMessage =
						t('collection.modal.form.errors.barcode.notFound') ||
						'No data found for this barcode';
					callbacks.setErrorMsg(errorMessage);
				} else {
					const errorMessage =
						error.message ||
						'An error occurred during barcode search';
					callbacks.setErrorMsg(errorMessage);
				}
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
