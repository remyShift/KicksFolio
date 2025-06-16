import { useState } from 'react';
import { CollectionService } from '@/services/CollectionService';
import { useSession } from '@/context/authContext';

export function useCreateCollection() {
	const [error, setError] = useState('');
	const collectionService = new CollectionService();
	const { user, sessionToken, refreshUserData } = useSession();

	const createCollection = async (collectionName: string) => {
		setError('');

		if (!user || !sessionToken) {
			setError('Session expired, please try logging in again.');
			return false;
		}

		return collectionService
			.create(collectionName, user.id, sessionToken)
			.then(() => {
				return refreshUserData(user, sessionToken);
			})
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error('Error in createCollection:', error);
				setError(
					error instanceof Error
						? error.message
						: 'Something went wrong when creating collection, please try again.'
				);
				return false;
			});
	};

	return { createCollection, error };
}
