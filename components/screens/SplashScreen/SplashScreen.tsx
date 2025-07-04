import { useEffect, useRef } from 'react';
import { useSession } from '@/context/authContext';
import { Image } from 'expo-image';
import { ShoeIcon } from './ShoeIcon';
import { AppTitle } from './AppTitle';
import { useInitialData } from '@/hooks/useInitialData';
import { View } from 'react-native';
import { useSplashScreenStore } from '@/store/useSplashScreenStore';

const MIN_SPLASH_DURATION = 2500;

export default function SplashScreen() {
    const { userSneakers, isLoading } = useSession();
    const { loadAndSetInitialData } = useInitialData();
    const { setIsVisible, setIsInitialized } = useSplashScreenStore();
    const startTime = useRef(Date.now());
    const initializationComplete = useRef(false);

    const preloadImages = async (imageUris: string[]) => {
        const prefetchTasks = imageUris.map(uri => Image.prefetch(uri));
        return Promise.all(prefetchTasks);
    };

    const checkAndHideSplashScreen = () => {
        const elapsedTime = Date.now() - startTime.current;
        
        if (initializationComplete.current && elapsedTime >= MIN_SPLASH_DURATION) {
            setIsVisible(false);
        } else if (initializationComplete.current) {
            const remainingTime = MIN_SPLASH_DURATION - elapsedTime;
            setTimeout(() => setIsVisible(false), remainingTime);
        }
    };

    useEffect(() => {
        const initializeApp = async () => {
            if (isLoading) return;

            try {
                await loadAndSetInitialData();
                console.log('[SplashScreen] loadAndSetInitialData resolved');

                if (userSneakers && userSneakers.length > 0) {
                    const sneakerImages = userSneakers
                        .filter(sneaker => sneaker.images?.length > 0)
                        .map(sneaker => sneaker.images[0]);
                    
                    if (sneakerImages.length > 0) {
                        const imageUris = sneakerImages.map(image => image.uri);
                        await preloadImages(imageUris);
                        console.log('[SplashScreen] preloadImages resolved');
                    }
                }

                setIsInitialized(true);
                initializationComplete.current = true;
                checkAndHideSplashScreen();
            } catch (error) {
                console.error('[SplashScreen] Initialization failed:', error);
                setIsInitialized(true);
                initializationComplete.current = true;
                checkAndHideSplashScreen();
            }
        };

        initializeApp();
    }, [isLoading, userSneakers]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkAndHideSplashScreen();
        }, MIN_SPLASH_DURATION);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <View className="flex-1 items-center justify-center bg-primary gap-1">
            <AppTitle text="KicksFolio" />
            <ShoeIcon
                name="shoe-sneaker"
                size={50}
                color="white"
            />
        </View>
    );
}
