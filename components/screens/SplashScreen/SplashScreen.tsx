import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useSession } from '@/context/authContext';
import { Image } from 'expo-image';
import { AnimatedIcon } from './AnimatedIcon';
import { AnimatedLogo } from './AnimatedText';
import { useInitialData } from '@/hooks/useInitialData';

export default function SplashScreen({ sessionToken, setIsSplashScreenVisible }: { sessionToken: string | null | undefined, setIsSplashScreenVisible: (value: boolean) => void }) {
    console.log('[SplashScreen] Mount');
    const [textAnimationFinished, setTextAnimationFinished] = useState(false);
    const { userSneakers } = useSession();
    const AnimatedView = Animated.createAnimatedComponent(View);
    const { loadInitialData } = useInitialData();

    const preloadImages = async (imageUris: string[]) => {
        const prefetchTasks = imageUris.map(uri => Image.prefetch(uri));
        await Promise.all(prefetchTasks);
    };

    const initializeApp = async () => {
        console.log('[SplashScreen] initializeApp called', { sessionToken, textAnimationFinished });
        if (sessionToken) {
            console.log('[SplashScreen] sessionToken exists');
            await loadInitialData()
                .then(() => {
                    console.log('[SplashScreen] loadInitialData resolved');
                });
            if (userSneakers) {
                const sneakerImages = userSneakers.map(sneaker => sneaker.images[0]);
                const imageUris = sneakerImages.map(image => image.url);
                preloadImages(imageUris)
                    .then(() => {
                        console.log('[SplashScreen] preloadImages resolved');
                    });
            }
        }

        if (textAnimationFinished) {
            console.log('[SplashScreen] textAnimationFinished, calling setIsSplashScreenVisible(false)');
            setIsSplashScreenVisible(false);
        }
    };

    useEffect(() => {
        initializeApp();
    }, [sessionToken, textAnimationFinished]);

    useEffect(() => {
        console.log('[SplashScreen] useEffect mount');
    }, []);

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
                    console.log('[SplashScreen] AnimatedIcon onAnimationComplete');
                    setTimeout(() => {
                        setTextAnimationFinished(true);
                        console.log('[SplashScreen] setTextAnimationFinished(true)');
                    }, 1500);
                }}
            />
        </AnimatedView>
    );
}
