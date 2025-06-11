import { Sneaker } from '@/types/Sneaker';
import { SneakersService } from '@/services/SneakersService';
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

export const useSneakerAPI = (sessionToken: string, userId: string) => {
	const sneakerService = new SneakersService(userId, sessionToken);
	const { refreshUserSneakers, userSneakers } = useSession();

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
				pricePaid: formData.price_paid || undefined,
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
		if (!sessionToken) {
			callbacks.setErrorMsg('Session expired. Please login again.');
			return Promise.resolve();
		}

		if (!sku.trim()) {
			callbacks.setErrorMsg('Please enter a SKU.');
			return Promise.resolve();
		}

		callbacks.setErrorMsg('');

		return sneakerService
			.searchBySku(sku.trim())
			.then((response) => {
				if (response) {
					const responseResult = response.results[0];

					const transformedSneaker = {
						model: responseResult.name || '',
						brand: responseResult.brand.toLowerCase() || '',
						description: responseResult.story || '',
						image: {
							url: responseResult.image['360'][0] || '',
						},
					};
					callbacks.setFetchedSneaker?.(transformedSneaker);
					callbacks.setModalStep('addForm');
				}
				return response;
			})
			.catch((error: string) => {
				callbacks.setErrorMsg(error);
				throw error;
			});
	};

	const handleFormSubmit = async (
		formData: SneakerFormData,
		callbacks?: Callbacks
	) => {
		if (!sessionToken) {
			callbacks?.setErrorMsg('No session token');
			return Promise.reject('No session token');
		}

		return validateSneakerData(formData)
			.then((validationResult) => {
				console.log('validationResult', validationResult);

				if (!validationResult.isValid) {
					const firstError = Object.values(
						validationResult.errors
					)[0];
					callbacks?.setErrorMsg(
						(firstError as string) || 'Validation failed'
					);
					return Promise.reject('Validation failed');
				}

				const sneakerToAdd: SneakerFormData = {
					model: formData.model,
					brand: formData.brand,
					status: formData.status,
					size: formData.size.toString(),
					condition: formData.condition.toString(),
					images: formData.images.map((img) => ({
						id: '',
						url: img.url,
					})),
					price_paid: formData.price_paid?.toString() || '',
					description: formData.description,
				};

				return sneakerService.add(sneakerToAdd);
			})
			.then((response) => {
				if (response && callbacks) {
					callbacks.setCurrentSneaker?.(response.sneaker);
					callbacks.setModalStep('view');

					setTimeout(() => {
						refreshUserSneakers();
					}, 100);
				}
				return response;
			})
			.catch((error: string) => {
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
		if (!sessionToken) {
			callbacks?.setErrorMsg('No session token');
			return Promise.reject('No session token');
		}

		let sneakerToUpdate: SneakerFormData;

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

				sneakerToUpdate = {
					model: formData.model,
					brand: formData.brand,
					status: formData.status,
					size: formData.size.toString(),
					condition: formData.condition.toString(),
					images: formData.images.map((img) => ({
						id: '',
						url: img.url,
					})),
					price_paid: formData.price_paid?.toString() || '',
					description: formData.description,
				};

				return sneakerService.update(sneakerId, sneakerToUpdate);
			})
			.then((response) => {
				if (response && callbacks) {
					const updatedSneaker = {
						...response.sneaker,
						images:
							response.sneaker.images ||
							sneakerToUpdate.images ||
							[],
					};

					callbacks.setCurrentSneaker?.(updatedSneaker);
					callbacks.setModalStep('view');

					setTimeout(() => {
						refreshUserSneakers();
					}, 100);
				} else {
					console.log('No response or callbacks');
				}
				return response;
			})
			.catch((error: string) => {
				callbacks?.setErrorMsg(
					`An error occurred while updating the sneaker: ${error}`
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
		if (!sessionToken) {
			return Promise.reject('No session token');
		}

		return sneakerService
			.delete(sneakerId)
			.then(async (response) => {
				await refreshUserSneakers();
				return response;
			})
			.catch((error: string) => {
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
