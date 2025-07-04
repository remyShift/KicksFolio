import { useEffect, useRef } from 'react';
import { useSession } from '@/context/authContext';
import { Image } from 'expo-image';
import { ShoeIcon } from './ShoeIcon';
import { AppTitle } from './AppTitle';
import { useInitialData } from '@/hooks/useInitialData';
import { View } from 'react-native';

export default function SplashScreen({ setIsSplashScreenVisible }: { setIsSplashScreenVisible: (value: boolean) => void }) {
    const { userSneakers, user } = useSession();
    const { loadAndSetInitialData } = useInitialData();
    const hasInitialized = useRef(false);

    const preloadImages = async (imageUris: string[]) => {
        const prefetchTasks = imageUris.map(uri => Image.prefetch(uri));
        await Promise.all(prefetchTasks);
    };

    const initializeApp = async () => {
        if (user && !hasInitialized.current) {
            hasInitialized.current = true;
            await loadAndSetInitialData()
                .then(() => {
                    console.log('[SplashScreen] loadAndSetInitialData resolved');
                });
            if (userSneakers) {
                const sneakerImages = userSneakers.map(sneaker => sneaker.images[0]);
                const imageUris = sneakerImages.map(image => image.uri);
                preloadImages(imageUris)
                    .then(() => {
                        setIsSplashScreenVisible(false);
                        console.log('[SplashScreen] preloadImages resolved');
                    });
            }
        }
    };

    useEffect(() => {
        initializeApp();
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
