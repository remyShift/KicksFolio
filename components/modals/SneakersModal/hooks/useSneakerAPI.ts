import { useState } from 'react';
import { useAsyncValidation } from '@/hooks/useAsyncValidation';
import { Sneaker } from '@/types/Sneaker';
import { SneakersService } from '@/services/SneakersService';
import { SneakerFormData } from '../types';
import { ModalStep } from '../types';
import { useSession } from '@/context/authContext';

interface Callbacks {
	onSuccess: (data: Sneaker) => void;
	onError: (error: string) => void;
}

export function useSneakerAPI(sessionToken: string, userId: string) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { checkSkuExists } = useAsyncValidation();
	const sneakerService = new SneakersService(userId, sessionToken);
	const { refreshUserSneakers, userSneakers } = useSession();

	const fetchSneakerData = async (sku: string): Promise<Sneaker | null> => {
		setIsLoading(true);
		setError(null);

		try {
			// Vérifier si le SKU existe déjà
			const skuError = await checkSkuExists(sku);
			if (skuError) {
				setError(skuError);
				return null;
			}

			// TODO: Implémenter l'appel API pour récupérer les données de la sneaker
			// Pour l'instant, retourner des données mockées
			const mockData: Sneaker = {
				id: 'mock-id',
				model: sku,
				price_paid: 0,
				brand: 'Nike',
				size: 42,
				condition: 10,
				status: 'new',
				purchase_date: new Date().toISOString(),
				description: '',
				estimated_value: 0,
				release_date: null,
				collection_id: 'mock-collection',
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				images: [],
			};

			return mockData;
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Une erreur est survenue lors de la récupération des données';
			setError(errorMessage);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const handleSkuSearch = async (sku: string, callbacks: Callbacks) => {
		setIsLoading(true);
		setError(null);

		try {
			const skuError = await checkSkuExists(sku);
			if (skuError) {
				setError(skuError);
				callbacks.onError(skuError);
				return;
			}

			const sneakerData = await fetchSneakerData(sku);
			if (sneakerData) {
				callbacks.onSuccess(sneakerData);
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Une erreur est survenue lors de la recherche';
			setError(errorMessage);
			callbacks.onError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFormSubmit = async (
		formData: SneakerFormData,
		currentStep: ModalStep
	) => {
		setIsLoading(true);
		setError(null);

		try {
			const skuError = await checkSkuExists(formData.model);
			if (skuError) {
				setError(skuError);
				return false;
			}

			// TODO: Implémenter la soumission du formulaire
			return true;
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Une erreur est survenue lors de la soumission';
			setError(errorMessage);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		fetchSneakerData,
		handleSkuSearch,
		handleFormSubmit,
		isLoading,
		error,
	};
}
