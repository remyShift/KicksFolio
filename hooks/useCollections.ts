import { useState, useEffect } from 'react';
import {
	SupabaseCollectionService,
	SupabaseCollection,
} from '../services/CollectionService';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useSession } from '@/context/authContext';

export const useCollections = () => {
	const { user, isAuthenticated } = useSupabaseAuth();
	const { setUserCollection, refreshUserData } = useSession();
	const [collections, setCollections] = useState<SupabaseCollection[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchCollections = async () => {
		if (!user?.id) return;

		setLoading(true);

		return SupabaseCollectionService.getUserCollections(user.id)
			.then((data) => {
				setCollections(data || []);
				return data;
			})
			.catch((error) => {
				console.error('Error fetching collections:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const createCollection = async (name: string) => {
		setLoading(true);

		return SupabaseCollectionService.createCollection(name)
			.then((newCollection) => {
				setCollections((prev) => [...prev, newCollection]);
				setUserCollection(newCollection);
				refreshUserData();
				return newCollection;
			})
			.catch((error) => {
				console.error('Error creating collection:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const updateCollection = async (
		id: string,
		updates: Partial<SupabaseCollection>
	) => {
		setLoading(true);

		return SupabaseCollectionService.updateCollection(id, updates)
			.then((updatedCollection) => {
				setCollections((prev) =>
					prev.map((col) => (col.id === id ? updatedCollection : col))
				);
				return updatedCollection;
			})
			.catch((error) => {
				console.error('Error updating collection:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const deleteCollection = async (id: string) => {
		setLoading(true);

		return SupabaseCollectionService.deleteCollection(id)
			.then(() => {
				setCollections((prev) => prev.filter((col) => col.id !== id));
			})
			.catch((error) => {
				console.error('Error deleting collection:', error);
				throw error;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (isAuthenticated && user?.id) {
			fetchCollections();
		} else {
			setCollections([]);
		}
	}, [isAuthenticated, user?.id]);

	return {
		collections,
		loading,
		fetchCollections,
		createCollection,
		updateCollection,
		deleteCollection,
	};
};
