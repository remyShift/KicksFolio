import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useState } from 'react';


type MainButtonProps = {
    content: string;
    onPressAction: () => void;
    backgroundColor: string;
    isDisabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MainButton({content, onPressAction, backgroundColor, isDisabled = false}: MainButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: withSpring(isDisabled ? 0.90 : 1)
            }
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