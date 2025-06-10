import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useState } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MainButton({content, onPressAction, backgroundColor}: {content: string, onPressAction: () => void, backgroundColor: string}) {
    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = backgroundColor === 'bg-gray-300' || backgroundColor === 'bg-gray-600' || isLoading;
    
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(isDisabled ? 0.85 : 1) }
        ]
    }));

    const handlePress = async () => {
        if (isDisabled) return;
        
        setIsLoading(true);
        onPressAction();
        setIsLoading(false);
    };

    return (
        <AnimatedPressable 
            className={`${backgroundColor} py-3 px-4 rounded-md w-1/2`}
            onPress={handlePress}
            style={animatedStyle}
        >
            <Text className="font-spacemono-bold text-lg text-center text-white">
                {content}
            </Text>
        </AnimatedPressable>
    );
}