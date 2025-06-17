import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useSession } from '@/context/authContext';
import { Image } from 'expo-image';
import { AnimatedIcon } from './AnimatedIcon';
import { AnimatedLogo } from './AnimatedText';
import { useInitialData } from '@/hooks/useInitialData';

export default function SplashScreen({ setIsSplashScreenVisible }: { setIsSplashScreenVisible: (value: boolean) => void }) {
    const [textAnimationFinished, setTextAnimationFinished] = useState(false);
    const { userSneakers, user } = useSession();
    const AnimatedView = Animated.createAnimatedComponent(View);
    const { loadAndSetInitialData } = useInitialData();

    const preloadImages = async (imageUris: string[]) => {
        const prefetchTasks = imageUris.map(uri => Image.prefetch(uri));
        await Promise.all(prefetchTasks);
    };

    const initializeApp = async () => {
        if (user) {
            await loadAndSetInitialData()
                .then(() => {
                    console.log('[SplashScreen] loadAndSetInitialData resolved');
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
            setIsSplashScreenVisible(false);
        }
    };

    useEffect(() => {
        initializeApp();
    }, [user, textAnimationFinished]);

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
