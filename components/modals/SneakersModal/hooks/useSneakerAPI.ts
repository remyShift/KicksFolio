import { useState } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { SneakersService } from '@/services/SneakersService';
import { ModalStep } from '../types';
import { SneakerFormData } from '../types';
import { SneakerValidationService } from '@/services/SneakerValidationService';

export const useSneakerAPI = (
	sessionToken: string | null,
	collectionId?: string
) => {
	const sneakerService = new SneakersService(
		collectionId || '',
		sessionToken || ''
	);

	const sneakerFormValidationService = new SneakerValidationService();

	const handleFormSubmit = async (
		formData: SneakerFormData,
		userId: string,
		currentSneakerId?: string,
		userSneakers?: Sneaker[] | null,
		callbacks?: {
			setUserSneakers?: (sneakers: Sneaker[] | null) => void;
			setSneaker?: (sneaker: Sneaker | null) => void;
			setModalStep?: (step: ModalStep) => void;
			setErrorMsg?: (error: string) => void;
		}
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
			.then((response) => {
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
			.catch((error) => {
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
			.then((response) => {
				return response;
			})
			.catch((error) => {
				throw error;
			});
	};

	const handleSkuLookup = async (
		sku: string,
		setSneakerFetchedInformation: (sneaker: Sneaker | null) => void,
		setErrorMsg: (error: string) => void
	) => {
		if (!sessionToken) {
			setErrorMsg('No session token');
			return Promise.reject('No session token');
		}

		return sneakerService
			.searchBySku(sku)
			.then((response) => {
				return response;
			})
			.then((data) => {
				if (data.results.length > 0) {
					const sneakerData = data.results[0];
					setSneakerFetchedInformation(sneakerData);
				} else {
					setErrorMsg(
						'No data found for this SKU, check the SKU and try again or add it manually.'
					);
				}
			})
			.catch((error) => {
				setErrorMsg(
					'Impossible to find the informations for this SKU. Please check the SKU and try again or add it manually.'
				);
				throw error;
			});
	};

	return {
		handleFormSubmit,
		handleSneakerDelete,
		handleSkuLookup,
	};
};
