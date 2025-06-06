import { useState } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { SneakersService } from '@/services/SneakersService';
import { ModalStep } from '../types';

export const useSneakerAPI = (
	sessionToken: string | null,
	collectionId?: string
) => {
	const [isLoading, setIsLoading] = useState(false);
	const sneakerService = new SneakersService(
		collectionId || '',
		sessionToken || ''
	);

	const handleSneakerSubmit = async (
		sneaker: Partial<Sneaker>,
		userId: string
	) => {
		if (!sessionToken) return Promise.reject('No session token');

		setIsLoading(true);

		const sneakerData: Sneaker = {
			id: sneaker.id || '',
			model: sneaker.model || '',
			brand: sneaker.brand || '',
			status: sneaker.status || '',
			size: sneaker.size || 0,
			condition: sneaker.condition || 0,
			images:
				sneaker.images?.map((img) => ({
					id: img.id || '',
					url: img.url,
				})) || [],
			price_paid: sneaker.price_paid || 0,
			description: sneaker.description || '',
			collection_id: sneaker.collection_id || '',
			purchase_date: sneaker.purchase_date || new Date().toISOString(),
			estimated_value: sneaker.estimated_value || 0,
			release_date: sneaker.release_date || null,
			created_at: sneaker.created_at || new Date().toISOString(),
			updated_at: sneaker.updated_at || new Date().toISOString(),
		};

		return sneakerService
			.add(sneakerData, sneaker.id || undefined)
			.then((response) => {
				setIsLoading(false);
				return response;
			})
			.catch((error) => {
				setIsLoading(false);
				throw error;
			});
	};

	const handleSneakerDelete = async (sneakerId: string) => {
		if (!sessionToken) return Promise.reject('No session token');

		setIsLoading(true);

		return sneakerService
			.delete(sneakerId)
			.then((response) => {
				setIsLoading(false);
				return response;
			})
			.catch((error) => {
				setIsLoading(false);
				throw error;
			});
	};

	const handleSkuLookup = async (
		sku: string,
		setSneaker: (sneaker: Sneaker | null) => void,
		setModalStep: (step: ModalStep) => void,
		setErrorMsg: (error: string) => void
	) => {
		if (!sessionToken) return Promise.reject('No session token');

		setIsLoading(true);

		return sneakerService
			.searchBySku(sku)
			.then((response) => {
				setIsLoading(false);
				return response;
			})
			.then((data) => {
				if (data.results && data.results.length > 0) {
					const sneakerData = data.results[0];
					setSneaker(sneakerData);
					setModalStep('addForm');
				} else {
					setErrorMsg(
						'No data found for this SKU, check the SKU and try again or add it manually.'
					);
				}
			})
			.catch((error) => {
				setIsLoading(false);
				setErrorMsg(
					'Impossible to find the informations for this SKU. Please check the SKU and try again or add it manually.'
				);
				throw error;
			});
	};

	return {
		handleSneakerSubmit,
		handleSneakerDelete,
		handleSkuLookup,
		isLoading,
	};
};
