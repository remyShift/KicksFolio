import { useEffect, useRef, useState } from 'react';

import { Image } from 'expo-image';

import { useSession } from '@/contexts/authContext';
import { deviceLanguage } from '@/locales/i18n';
import { storageProvider } from '@/services/StorageService';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { useSplashScreenStore } from '@/store/useSplashScreenStore';
import { FollowingUserWithSneakers } from '@/types/auth';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';

const MIN_SPLASH_DURATION = 1500;
const MAX_INITIALIZATION_TIME = 10000;
const BATCH_SIZE = 5;
const BATCH_DELAY = 50;

async function animateProgress(
	currentProgress: number,
	targetProgress: number,
	setLoadingProgress: (value: number) => void,
	delayPerStep: number = 15
) {
	for (let i = currentProgress + 1; i <= targetProgress; i++) {
		setLoadingProgress(i);
		await new Promise((resolve) => setTimeout(resolve, delayPerStep));
	}
}

async function prefetchImagesInBackground(
	imageUris: string[],
	currentProgress: number,
	setLoadingProgress: (value: number) => void,
	setLoadingStatus: (value: string) => void
) {
	const functionStart = Date.now();
	const batches = [];
	for (let i = 0; i < imageUris.length; i += BATCH_SIZE) {
		batches.push(imageUris.slice(i, i + BATCH_SIZE));
	}

	console.log(
		`[AppInit-BG] 📦 Prefetching ${imageUris.length} images in ${batches.length} batches`
	);

	const startProgress = currentProgress;
	const endProgress = 90;
	const progressPerBatch = (endProgress - startProgress) / batches.length;

	let progressTracker = startProgress;

	for (let i = 0; i < batches.length; i++) {
		const batch = batches[i];
		const batchStart = Date.now();
		try {
			setLoadingStatus(
				`Préchargement des images (${i + 1}/${batches.length})...`
			);

			const targetProgress = Math.round(
				startProgress + progressPerBatch * (i + 1)
			);
			await animateProgress(
				progressTracker,
				targetProgress,
				setLoadingProgress,
				20
			);
			progressTracker = targetProgress;

			await Promise.allSettled(
				batch.map(async (uri) => {
					try {
						await Image.prefetch(uri);
					} catch (err) {
						console.warn(
							`[AppInit-BG] Failed to prefetch image: ${uri}`,
							err
						);
					}
				})
			);
			console.log(
				`[AppInit-BG] ✅ Batch ${i + 1}/${batches.length} prefetched in ${Date.now() - batchStart}ms`
			);

			if (i < batches.length - 1) {
				await new Promise((resolve) =>
					setTimeout(resolve, BATCH_DELAY)
				);
			}
		} catch (err) {
			console.warn(
				`[AppInit-BG] ❌ Batch ${i + 1} prefetching failed:`,
				err
			);
		}
	}

	console.log(
		`[AppInit-BG] 🏁 Background image prefetching completed in ${Date.now() - functionStart}ms`
	);
}

export function useAppInitialization(fontsLoaded: boolean) {
	const {
		setUser,
		setUserSneakers,
		setFollowingUsers,
		isLoading: sessionLoading,
	} = useSession();
	const { initializeLanguage } = useLanguageStore();
	const { initializeUnit } = useSizeUnitStore();
	const { initializeCurrency } = useCurrencyStore();
	const {
		setIsVisible,
		setIsInitialized,
		setLoadingProgress,
		setLoadingStatus,
	} = useSplashScreenStore();

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
				console.log('[AppInit] ===== Starting initialization =====');
				console.log('[AppInit] Timestamp:', Date.now());
				setLoadingProgress(0);
				setLoadingStatus("Démarrage de l'application...");

				console.log('[AppInit] Initializing stores in parallel...');
				const storesStart = Date.now();
				setLoadingStatus('Chargement des préférences...');
				const storesPromise = Promise.all([
					initializeLanguage(deviceLanguage),
					initializeUnit(),
					initializeCurrency(),
				]);
				await animateProgress(0, 30, setLoadingProgress, 15);
				await storesPromise;
				console.log(
					'[AppInit] ✅ Stores initialized in',
					Date.now() - storesStart,
					'ms (parallel)'
				);

				console.log('[AppInit] Loading stored data in parallel...');
				const dataStart = Date.now();
				setLoadingStatus('Chargement de vos données...');
				const dataPromise = Promise.all([
					storageProvider.getItem<User>('user'),
					storageProvider.getItem<Sneaker[]>('sneakers'),
					storageProvider.getItem<FollowingUserWithSneakers[]>(
						'followingUsers'
					),
				]);
				await animateProgress(30, 50, setLoadingProgress, 12);
				const [storedUser, storedSneakers, storedFollowingUsers] =
					await dataPromise;
				console.log(
					'[AppInit] ✅ Data loaded in',
					Date.now() - dataStart,
					'ms (parallel)'
				);

				if (storedUser) {
					console.log('[AppInit] ✅ User found in storage');
					setLoadingStatus('Profil chargé');
					setUser(storedUser);
				} else {
					console.log('[AppInit] ⚠️  No user in storage');
				}

				if (storedSneakers && storedSneakers.length > 0) {
					console.log(
						`[AppInit] ✅ ${storedSneakers.length} sneakers found in storage`
					);
					setLoadingStatus(
						`${storedSneakers.length} sneaker${storedSneakers.length > 1 ? 's' : ''} chargée${storedSneakers.length > 1 ? 's' : ''}`
					);
					setUserSneakers(storedSneakers);
				} else {
					console.log('[AppInit] ⚠️  No sneakers in storage');
				}

				if (storedFollowingUsers && storedFollowingUsers.length > 0) {
					console.log(
						`[AppInit] ✅ ${storedFollowingUsers.length} following users found in storage`
					);
					setFollowingUsers(storedFollowingUsers);
				} else {
					console.log('[AppInit] ⚠️  No following users in storage');
				}

				const animStart = Date.now();
				await animateProgress(50, 60, setLoadingProgress, 12);
				console.log(
					'[AppInit] Animation 50→60 took',
					Date.now() - animStart,
					'ms'
				);

				const prefetchStart = Date.now();
				const allImageUris: string[] = [];

				if (storedSneakers && storedSneakers.length > 0) {
					const sneakerImages = storedSneakers
						.filter((sneaker) => sneaker.images?.length > 0)
						.map((sneaker) => sneaker.images[0].uri);
					allImageUris.push(...sneakerImages);
				}

				if (storedUser?.profile_picture) {
					allImageUris.push(storedUser.profile_picture);
				}

				if (storedFollowingUsers && storedFollowingUsers.length > 0) {
					const followingProfilePics = storedFollowingUsers
						.filter((user: any) => user.profile_picture)
						.map((user: any) => user.profile_picture);
					allImageUris.push(...followingProfilePics);

					const followingSneakerImages = storedFollowingUsers
						.flatMap((user: any) => user.sneakers || [])
						.filter((sneaker: any) => sneaker.images?.length > 0)
						.map((sneaker: any) => sneaker.images[0].uri);
					allImageUris.push(...followingSneakerImages);
				}

				if (allImageUris.length > 0) {
					console.log(
						`[AppInit] 🚀 Starting background prefetch of ${allImageUris.length} images (non-blocking)...`
					);
					setLoadingStatus('Optimisation des images...');
					await animateProgress(60, 80, setLoadingProgress, 10);

					prefetchImagesInBackground(
						allImageUris,
						80,
						setLoadingProgress,
						setLoadingStatus
					)
						.then(() => {
							console.log(
								'[AppInit] ✅ Background image prefetch completed in',
								Date.now() - prefetchStart,
								'ms'
							);
						})
						.catch((err) =>
							console.warn(
								'[AppInit] ❌ Background prefetch failed:',
								err
							)
						);
					console.log(
						'[AppInit] Continuing without waiting for images...'
					);
				} else {
					console.log('[AppInit] ⚠️  No images to prefetch');
					await animateProgress(60, 80, setLoadingProgress, 10);
				}

				console.log('[AppInit] Finalizing...');
				const finalStart = Date.now();
				setLoadingStatus('Finalisation...');
				await animateProgress(80, 95, setLoadingProgress, 10);
				console.log(
					'[AppInit] Animation 80→95 took',
					Date.now() - finalStart,
					'ms'
				);

				const elapsedTime = Date.now() - startTimeRef.current;
				const remainingTime = Math.max(
					0,
					MIN_SPLASH_DURATION - elapsedTime
				);
				console.log('[AppInit] Elapsed time:', elapsedTime, 'ms');
				console.log(
					'[AppInit] Remaining time to reach MIN_SPLASH_DURATION:',
					remainingTime,
					'ms'
				);

				if (remainingTime > 0) {
					console.log(
						'[AppInit] Waiting',
						remainingTime,
						'ms to reach minimum duration...'
					);
					await new Promise((resolve) =>
						setTimeout(resolve, remainingTime)
					);
				}

				console.log('[AppInit] ===== Initialization complete =====');
				setLoadingStatus('Prêt !');
				const completeStart = Date.now();
				await animateProgress(95, 100, setLoadingProgress, 15);
				await new Promise((resolve) => setTimeout(resolve, 200));
				console.log(
					'[AppInit] Final animation took',
					Date.now() - completeStart,
					'ms'
				);

				const totalTime = Date.now() - initStartTime;
				console.log(
					'[AppInit] 🎉 TOTAL INITIALIZATION TIME:',
					totalTime,
					'ms'
				);
				console.log('[AppInit] ===================================');

				clearTimeout(safetyTimeout);
				setIsInitialized(true);
				setIsVisible(false);
				setIsInitializing(false);
			} catch (error) {
				console.error('[AppInit] Initialization failed:', error);
				setLoadingStatus('Erreur de chargement');
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

				setLoadingProgress(100);
				setIsInitialized(true);
				setIsVisible(false);
				setIsInitializing(false);
			}
		};

		initializeApp();
	}, [fontsLoaded, sessionLoading]);

	return { isInitializing };
}
