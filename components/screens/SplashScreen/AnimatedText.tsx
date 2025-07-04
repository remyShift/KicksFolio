import Animated, { 
    useSharedValue, 
    withSpring, 
    withTiming,
    useAnimatedStyle
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface AnimatedLogoProps {
    text: string;
    className?: string;
}

export const AnimatedLogo = ({ text, className = "text-white text-6xl font-bold font-actonia" }: AnimatedLogoProps) => {
    const translateX = useSharedValue(100);
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value
    }));

    useEffect(() => {
        translateX.value = withSpring(0);
        opacity.value = withTiming(1, { duration: 1000 });
    }, []);

    return (
        <Animated.View className="flex-row" style={animatedStyle}>
            <Animated.Text className={className}>
                {text}
            </Animated.Text>
        </Animated.View>
    );
}; 