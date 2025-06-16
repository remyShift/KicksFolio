import { useState, useEffect } from 'react';
import { SneakerService, Sneaker } from '../services/supabase';

export const useSneakers = (collectionId?: string) => {
	const [sneakers, setSneakers] = useState<Sneaker[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchSneakers = async (targetCollectionId?: string) => {
		const id = targetCollectionId || collectionId;
		if (!id) return;

		setLoading(true);

		return SneakerService.getSneakersByCollection(id)
			.then((data) => {
				setSneakers(data || []);
				return data;
			})
			.catch((error) => {
				console.error('Error fetching sneakers:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const createSneaker = async (
		sneakerData: Omit<Sneaker, 'id' | 'created_at' | 'updated_at'>
	) => {
		setLoading(true);

		return SneakerService.createSneaker(sneakerData)
			.then((newSneaker) => {
				setSneakers((prev) => [newSneaker, ...prev]);
				return newSneaker;
			})
			.catch((error) => {
				console.error('Error creating sneaker:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const updateSneaker = async (id: string, updates: Partial<Sneaker>) => {
		setLoading(true);

		return SneakerService.updateSneaker(id, updates)
			.then((updatedSneaker) => {
				setSneakers((prev) =>
					prev.map((sneaker) =>
						sneaker.id === id ? updatedSneaker : sneaker
					)
				);
				return updatedSneaker;
			})
			.catch((error) => {
				console.error('Error updating sneaker:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const deleteSneaker = async (id: string) => {
		setLoading(true);

		return SneakerService.deleteSneaker(id)
			.then(() => {
				setSneakers((prev) =>
					prev.filter((sneaker) => sneaker.id !== id)
				);
			})
			.catch((error) => {
				console.error('Error deleting sneaker:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const uploadSneakerImage = async (sneakerId: string, imageUri: string) => {
		setLoading(true);

		return SneakerService.uploadSneakerImage(sneakerId, imageUri)
			.then((imageUrl) => {
				// Mettre à jour le sneaker avec la nouvelle URL d'image
				return updateSneaker(sneakerId, { description: imageUrl }).then(
					() => imageUrl
				);
			})
			.catch((error) => {
				console.error('Error uploading sneaker image:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const getSneakersByStatus = (status: string) => {
		return sneakers.filter((sneaker) => sneaker.status === status);
	};

	const getTotalValue = () => {
		return sneakers.reduce((total, sneaker) => {
			return total + (sneaker.estimated_value || sneaker.price_paid || 0);
		}, 0);
	};

	const getConditionStats = () => {
		const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		sneakers.forEach((sneaker) => {
			stats[sneaker.condition as keyof typeof stats]++;
		});
		return stats;
	};

	useEffect(() => {
		if (collectionId) {
			fetchSneakers(collectionId);
		}
	}, [collectionId]);

	return {
		sneakers,
		loading,
		fetchSneakers,
		createSneaker,
		updateSneaker,
		deleteSneaker,
		uploadSneakerImage,
		getSneakersByStatus,
		getTotalValue,
		getConditionStats,
	};
};
