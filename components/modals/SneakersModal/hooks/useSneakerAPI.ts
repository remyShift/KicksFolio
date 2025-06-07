import { useState } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { SneakersService } from '@/services/SneakersService';
import { SneakerValidationService } from '@/services/SneakerValidationService';
import { SneakerFormData } from '../types';
import { ModalStep } from '../types';

interface Callbacks {
	setUserSneakers?: (sneakers: Sneaker[] | null) => void;
	setSneaker?: (sneaker: Sneaker | null) => void;
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
					const transformedSneaker = {
						id: '',
						model: response.name || '',
						brand: response.brand || '',
						status: '',
						size: 0,
						condition: 0,
						images: response.image
							? [
									{
										id: '',
										url:
											response.image.small ||
											response.image.original ||
											'',
									},
							  ]
							: [],
						price_paid: 0,
						description: response.story || '',
						collection_id: collectionId,
						purchase_date: response.releaseDate,
						estimated_value: response.estimatedMarketValue || 0,
						release_date: response.releaseDate || null,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					};
					callbacks.setSneaker?.(transformedSneaker);
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
		userId: string,
		currentSneakerId?: string,
		userSneakers?: Sneaker[] | null,
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
			id: currentSneakerId || '',
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
			.add(sneakerToAdd, sneakerToAdd.id)
			.then((response: any) => {
				if (response && callbacks) {
					const updatedSneakers = userSneakers
						? [...userSneakers, response]
						: [response];
					callbacks.setUserSneakers?.(updatedSneakers);
					callbacks.setSneaker?.(response);
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
