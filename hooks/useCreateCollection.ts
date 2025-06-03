import { useState } from 'react';
import { CollectionService } from '@/services/CollectionService';
import { useSession } from '@/context/authContext';
import { useAuth } from './useAuth';

export function useCreateCollection() {
	const [error, setError] = useState('');
	const collectionService = new CollectionService();
	const { user, sessionToken } = useSession();
	const { getUserCollection } = useAuth();

	const createCollection = async (collectionName: string) => {
		console.log('createCollection : ', collectionName);
		setError('');

		if (!user || !sessionToken) {
			console.log('user or sessionToken is not defined');
			setError('Something went wrong, please try again.');
			return false;
		}

		return collectionService
			.create(collectionName, user.id, sessionToken)
			.then(async () => {
				return await getUserCollection(user, sessionToken)
					.then(() => {
						return true;
					})
					.catch(() => {
						setError(
							'Something went wrong when getting user collection, please try again.'
						);
						return false;
					});
			})
			.catch(() => {
				setError(
					'Something went wrong when creating collection, please try again.'
				);
				return false;
			});
	};

	return { createCollection, error };
}
