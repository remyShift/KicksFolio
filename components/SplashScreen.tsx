import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/ProfileData';
import { Image } from 'expo-image';

export default function SplashScreen({ sessionToken, loadInitialData, setIsSplashScreenVisible }: { sessionToken: string | null | undefined, loadInitialData: () => Promise<void>, setIsSplashScreenVisible: (value: boolean) => void }) {
  const [textAnimationFinished, setTextAnimationFinished] = useState(false);
  const { userSneakers } = useSession();
  const letters = 'KicksFolio'.split('');
  const AnimatedShoeIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);
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
        {letters.map((letter, index) => (
          <Animated.Text
            key={index}
            entering={FadeIn.duration(500).delay(index * 150)}
            exiting={FadeOut.duration(500)}
            className="text-white text-6xl font-bold font-actonia px-2.5"
            style={{ marginRight: index < letters.length - 1 ? -12 : 0 }}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
      <AnimatedShoeIcon
        name="shoe-sneaker"
        size={50}
        color="white"
        entering={FadeIn.duration(800).delay(1500)}
        exiting={FadeOut.duration(500)}
        onLayout={() => {
          setTimeout(() => {
            setTextAnimationFinished(true);
          }, 3500);
        }}
      />
    </AnimatedView>
  );
}
