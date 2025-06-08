import { Sneaker } from '@/types/Sneaker';
import { SneakersService } from '@/services/SneakersService';
import { SneakerValidationService } from '@/services/SneakerValidationService';
import { SneakerFormData } from '../types';
import { ModalStep } from '../types';
import { FetchedSneaker } from '@/store/useModalStore';

interface Callbacks {
	setCurrentSneaker?: (sneaker: Sneaker | null) => void;
	setFetchedSneaker?: (sneaker: FetchedSneaker | null) => void;
	setModalStep?: (step: ModalStep) => void;
	setErrorMsg?: (error: string) => void;
}

export const useSneakerAPI = (sessionToken: string, collectionId: string) => {
	const sneakerService = new SneakersService(collectionId, sessionToken);
	const sneakerFormValidationService = new SneakerValidationService();

	const handleSkuSearch = (sku: string, callbacks: Callbacks) => {
		if (!sessionToken) {
			callbacks.setErrorMsg?.('Session expired. Please login again.');
			return;
		}

		if (!sku.trim()) {
			callbacks.setErrorMsg?.('Please enter a SKU.');
			return;
		}

		callbacks.setErrorMsg?.('');

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
					callbacks.setModalStep?.('addForm');
				}
				return response;
			})
			.catch((error: string) => {
				callbacks.setErrorMsg?.(error);
				throw error;
			});
	};

	const handleFormSubmit = async (
		formData: SneakerFormData,
		callbacks?: Callbacks
	) => {
		if (!sessionToken) {
			callbacks?.setErrorMsg?.('No session token');
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

		if (!validationResult.isValid) {
			const firstError = Object.values(validationResult.errors)[0];
			callbacks?.setErrorMsg?.(firstError || 'Validation failed');
			return;
		}

		const sneakerToAdd: Sneaker = {
			id: '',
			model: formData.model,
			brand: formData.brand,
			status: formData.status,
			size: Number(formData.size),
			condition: Number(formData.condition),
			images: formData.images.map((img) => ({ id: '', url: img.url })),
			price_paid: Number(formData.price_paid),
			description: formData.description,
			collection_id: collectionId || '',
			purchase_date: new Date().toISOString(),
			estimated_value: 0,
			release_date: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		return sneakerService
			.add(sneakerToAdd)
			.then((response: any) => {
				if (response && callbacks) {
					callbacks.setCurrentSneaker?.(response);
					callbacks.setModalStep?.('view');
				}
				return response;
			})
			.catch((error: string) => {
				callbacks?.setErrorMsg?.(
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
			.then((response: any) => {
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
