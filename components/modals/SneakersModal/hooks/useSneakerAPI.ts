import { Sneaker } from '@/types/Sneaker';
import { SneakersService } from '@/services/SneakersService';
import { SneakerValidationService } from '@/services/SneakerValidationService';
import { SneakerFormData } from '../types';
import { ModalStep } from '../types';
import { FetchedSneaker } from '@/store/useModalStore';
import { useSession } from '@/context/authContext';

interface Callbacks {
	setCurrentSneaker?: (sneaker: Sneaker | null) => void;
	setFetchedSneaker?: (sneaker: FetchedSneaker | null) => void;
	setModalStep: (step: ModalStep) => void;
	setErrorMsg: (error: string) => void;
}

export const useSneakerAPI = (sessionToken: string, userId: string) => {
	const sneakerService = new SneakersService(userId, sessionToken);
	const sneakerFormValidationService = new SneakerValidationService();
	const { refreshUserSneakers } = useSession();

	const handleSkuSearch = (sku: string, callbacks: Callbacks) => {
		if (!sessionToken) {
			callbacks.setErrorMsg('Session expired. Please login again.');
			return;
		}

		if (!sku.trim()) {
			callbacks.setErrorMsg('Please enter a SKU.');
			return;
		}

		callbacks.setErrorMsg('');

		return sneakerService
			.searchBySku(sku.trim())
			.then((response: any) => {
				if (response) {
					const responseResult = response.results[0];

					const transformedSneaker = {
						model: responseResult.name || '',
						brand: responseResult.brand || '',
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

		const validationData = {
			name: formData.model,
			brand: formData.brand,
			size: formData.size,
			condition: formData.condition,
			status: formData.status,
			price: formData.price_paid,
			image: formData.images[0]?.url || '',
		};

		const validationResult =
			sneakerFormValidationService.validateAllFields(validationData);

		console.log('validationResult', validationResult);

		if (!validationResult.isValid) {
			const firstError = Object.values(validationResult.errors)[0];
			callbacks?.setErrorMsg(firstError || 'Validation failed');
			return;
		}

		const sneakerToAdd: SneakerFormData = {
			model: formData.model,
			brand: formData.brand,
			status: formData.status,
			size: formData.size.toString(),
			condition: formData.condition.toString(),
			images: formData.images.map((img) => ({ id: '', url: img.url })),
			price_paid: formData.price_paid.toString(),
			description: formData.description,
		};

		return sneakerService
			.add(sneakerToAdd)
			.then(async (response) => {
				if (response && callbacks) {
					callbacks.setCurrentSneaker?.(response.sneaker);
					callbacks.setModalStep('view');

					// Rafraîchir automatiquement les données après ajout
					await refreshUserSneakers();
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

	const handleSneakerDelete = async (sneakerId: string) => {
		if (!sessionToken) {
			return Promise.reject('No session token');
		}

		return sneakerService
			.delete(sneakerId)
			.then(async (response: any) => {
				// Rafraîchir automatiquement les données après suppression
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
		handleSneakerDelete,
	};
};
