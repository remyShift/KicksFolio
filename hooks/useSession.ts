import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/User';
import { authService } from '@/services/AuthService';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';
import { collectionService } from '@/services/CollectionService';
import { SneakersService } from '@/services/SneakersService';

export const useSession = () => {
	const [sessionToken, setSessionToken] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [userCollection, setUserCollection] = useState<Collection | null>(
		null
	);
	const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);

	useEffect(() => {
		const loadSession = () => {
			AsyncStorage.getItem('sessionToken')
				.then((token) => {
					setSessionToken(token);
				})
				.catch((error) => {
					console.error('Error loading session:', error);
				});
		};

		loadSession();
	}, []);

	useEffect(() => {
		if (sessionToken) {
			authService.getUser(sessionToken).then((data) => {
				setUser(data.user);

				collectionService
					.getUserCollection(data.user.id, sessionToken)
					.then((data) => {
						setUserCollection(data.collection);

						const sneakersService = new SneakersService(
							data.user.id,
							sessionToken
						);

						sneakersService.getUserSneakers().then((data) => {
							setUserSneakers(data);
						});
					});
			});
		}
	}, [sessionToken]);

	const updateSession = (token: string | null) => {
		if (token) {
			AsyncStorage.setItem('sessionToken', token)
				.then(() => {
					setSessionToken(token);
				})
				.catch((error) => {
					console.error('Error updating session:', error);
				});
		} else {
			AsyncStorage.removeItem('sessionToken')
				.then(() => {
					setSessionToken(null);
				})
				.catch((error) => {
					console.error('Error updating session:', error);
				});
		}
	};

	return {
		sessionToken,
		updateSession,
		user,
		userCollection,
		userSneakers,
	};
};
