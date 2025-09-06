import { useEffect, useRef, useState } from 'react';

import { Image } from 'expo-image';

import { useSession } from '@/contexts/authContext';
import { deviceLanguage } from '@/locales/i18n';
import { storageProvider } from '@/services/StorageService';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { useSplashScreenStore } from '@/store/useSplashScreenStore';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';

const MIN_SPLASH_DURATION = 2000;
const MAX_INITIALIZATION_TIME = 10000;

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
			const initStartTime = Date.now();

			const safetyTimeout = setTimeout(() => {
				console.warn(
					'[AppInit] Safety timeout triggered after 10s - forcing splash screen to hide'
				);
				setIsInitialized(true);
				setIsVisible(false);
				setIsInitializing(false);
			}, MAX_INITIALIZATION_TIME);

			try {
				hasInitializedRef.current = true;
				console.log('[AppInit] Starting initialization');

				console.log('[AppInit] Initializing stores...');
				await Promise.all([
					initializeLanguage(deviceLanguage),
					initializeUnit(),
					initializeCurrency(),
				]);

				console.log('[AppInit] Loading stored data...');
				const [storedUser, storedSneakers] = await Promise.all([
					storageProvider.getItem<User>('user'),
					storageProvider.getItem<Sneaker[]>('sneakers'),
				]);

				if (storedUser) {
					console.log('[AppInit] User found in storage');
					setUser(storedUser);
				}
				if (storedSneakers) {
					console.log(
						`[AppInit] ${storedSneakers.length} sneakers found in storage`
					);
					setUserSneakers(storedSneakers);
				}

				if (storedSneakers && storedSneakers.length > 0) {
					const imageUris = storedSneakers
						.filter((sneaker) => sneaker.images?.length > 0)
						.map((sneaker) => sneaker.images[0].uri);

					if (imageUris.length > 0) {
						console.log(
							`[AppInit] Prefetching ${imageUris.length} images...`
						);
						try {
							await Promise.allSettled(
								imageUris.map(async (uri) => {
									try {
										await Image.prefetch(uri);
									} catch (err) {
										console.warn(
											`[AppInit] Failed to prefetch image: ${uri}`,
											err
										);
									}
								})
							);
							console.log(
								'[AppInit] Image prefetching completed'
							);
						} catch (err) {
							console.warn(
								'[AppInit] Image prefetching failed:',
								err
							);
						}
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
				clearTimeout(safetyTimeout);
				setIsInitialized(true);
				setIsVisible(false);
				setIsInitializing(false);
			} catch (error) {
				console.error('[AppInit] Initialization failed:', error);
				clearTimeout(safetyTimeout);

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
