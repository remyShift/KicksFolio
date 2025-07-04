import { useEffect, useRef } from 'react';
import { useSession } from '@/context/authContext';
import { Image } from 'expo-image';
import { ShoeIcon } from './ShoeIcon';
import { AppTitle } from './AppTitle';
import { useInitialData } from '@/hooks/useInitialData';
import { View } from 'react-native';

export default function SplashScreen({ setIsSplashScreenVisible }: { setIsSplashScreenVisible: (value: boolean) => void }) {
    const { userSneakers, user, isLoading } = useSession();
    const { loadAndSetInitialData } = useInitialData();
    const hasInitialized = useRef(false);

    const preloadImages = async (imageUris: string[]) => {
        const prefetchTasks = imageUris.map(uri => Image.prefetch(uri));
        return Promise.all(prefetchTasks);
    };

    const initializeApp = async () => {
        if (isLoading) {
            return;
        }

        if (hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;

        await loadAndSetInitialData()
            .then(() => {
                console.log('[SplashScreen] loadAndSetInitialData resolved');
            })
            .catch((error) => {
                console.error('[SplashScreen] loadAndSetInitialData failed:', error);
            });

        if (userSneakers && userSneakers.length > 0) {
            const sneakerImages = userSneakers
                .filter(sneaker => sneaker.images && sneaker.images.length > 0)
                .map(sneaker => sneaker.images[0]);
            
            if (sneakerImages.length > 0) {
                const imageUris = sneakerImages.map(image => image.uri);
                await preloadImages(imageUris)
                    .then(() => {
                        console.log('[SplashScreen] preloadImages resolved');
                    })
                    .catch((error) => {
                        console.error('[SplashScreen] preloadImages failed:', error);
                    });
            }
        }

        setIsSplashScreenVisible(false);
    };

    useEffect(() => {
        initializeApp();
    }, [isLoading, user, userSneakers]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            console.warn('[SplashScreen] Timeout reached, closing splash screen');
            setIsSplashScreenVisible(false);
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, [setIsSplashScreenVisible]);

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
