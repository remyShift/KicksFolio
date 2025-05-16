import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/context/authContext';
import { Image } from 'expo-image';
import { AnimatedIcon } from '@/components/screens/SplashScreen/AnimatedIcon';
import { AnimatedLogo } from './AnimatedText';

export default function SplashScreen({ sessionToken, loadInitialData, setIsSplashScreenVisible }: { sessionToken: string | null | undefined, loadInitialData: () => Promise<void>, setIsSplashScreenVisible: (value: boolean) => void }) {
    const [textAnimationFinished, setTextAnimationFinished] = useState(false);
    const { userSneakers } = useSession();
    const AnimatedView = Animated.createAnimatedComponent(View);

    const preloadImages = async (imageUris: string[]) => {
        const prefetchTasks = imageUris.map(uri => Image.prefetch(uri));
        await Promise.all(prefetchTasks);
    };

    const initializeApp = async () => {
        if (sessionToken) {
            await loadInitialData();
            if (userSneakers) {
                const sneakerImages = userSneakers.map(sneaker => sneaker.images[0]);
                const imageUris = sneakerImages.map(image => image.url);
                preloadImages(imageUris);
            }
        }

        if (textAnimationFinished) {
            setIsSplashScreenVisible(false);
        }
    };

    useEffect(() => {
        initializeApp();
    }, [sessionToken, textAnimationFinished]);

    return (
        <AnimatedView 
        className="flex-1 items-center justify-center bg-primary"
        exiting={FadeOut.duration(500)}
        >
            <View className="flex-row">
                <AnimatedLogo text="KicksFolio" />
            </View>            

            <AnimatedIcon
                name="shoe-sneaker"
                size={50}
                color="white"
                onAnimationComplete={() => {
                    setTimeout(() => {
                        setTextAnimationFinished(true);
                    }, 1500);
                }}
            />
        </AnimatedView>
    );
}
