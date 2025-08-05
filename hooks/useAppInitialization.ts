import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/context/authContext';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useSplashScreenStore } from '@/store/useSplashScreenStore';
import { storageProvider } from '@/services/StorageService';
import { deviceLanguage } from '@/locales/i18n';
import { User } from '@/types/user';
import { Sneaker } from '@/types/sneaker';
import { Image } from 'expo-image';

const MIN_SPLASH_DURATION = 2000;

export function useAppInitialization(fontsLoaded: boolean) {
	const {
		setUser,
		setUserSneakers,
		isLoading: sessionLoading,
	} = useSession();
	const { initializeLanguage } = useLanguageStore();
	const { initializeUnit } = useSizeUnitStore();
	const { initializeCurrency } = useCurrencyStore();
	const { setIsVisible, setIsInitialized } = useSplashScreenStore();

	const [isInitializing, setIsInitializing] = useState(true);
	const startTimeRef = useRef(Date.now());
	const hasInitializedRef = useRef(false);

	useEffect(() => {
		if (!fontsLoaded || sessionLoading || hasInitializedRef.current) return;

		const initializeApp = async () => {
			try {
				hasInitializedRef.current = true;
				console.log('[AppInit] Starting initialization');

				await Promise.all([
					initializeLanguage(deviceLanguage),
					initializeUnit(),
					initializeCurrency(),
				]);

				const [storedUser, storedSneakers] = await Promise.all([
					storageProvider.getItem<User>('user'),
					storageProvider.getItem<Sneaker[]>('sneakers'),
				]);

				if (storedUser) setUser(storedUser);
				if (storedSneakers) setUserSneakers(storedSneakers);

				if (storedSneakers && storedSneakers.length > 0) {
					const imageUris = storedSneakers
						.filter((sneaker) => sneaker.images?.length > 0)
						.map((sneaker) => sneaker.images[0].uri);

					if (imageUris.length > 0) {
						await Promise.all(
							imageUris.map((uri) => Image.prefetch(uri))
						);
					}
				}

				const elapsedTime = Date.now() - startTimeRef.current;
				const remainingTime = Math.max(
					0,
					MIN_SPLASH_DURATION - elapsedTime
				);

				if (remainingTime > 0) {
					await new Promise((resolve) =>
						setTimeout(resolve, remainingTime)
					);
				}

				console.log('[AppInit] Initialization complete');
				setIsInitialized(true);
				setIsVisible(false);
				setIsInitializing(false);
			} catch (error) {
				console.error('[AppInit] Initialization failed:', error);

				const elapsedTime = Date.now() - startTimeRef.current;
				const remainingTime = Math.max(
					0,
					MIN_SPLASH_DURATION - elapsedTime
				);

				if (remainingTime > 0) {
					await new Promise((resolve) =>
						setTimeout(resolve, remainingTime)
					);
				}

				setIsInitialized(true);
				setIsVisible(false);
				setIsInitializing(false);
			}
		};

		initializeApp();
	}, [fontsLoaded, sessionLoading]);

	return { isInitializing };
}
