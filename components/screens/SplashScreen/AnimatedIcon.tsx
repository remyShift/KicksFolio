import { useEffect } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface AnimatedIconProps {
    name: keyof typeof MaterialCommunityIcons.glyphMap;
    size: number;
    color: string;
    onAnimationComplete: () => void;
}

export const AnimatedIcon = ({ name, size, color, onAnimationComplete }: AnimatedIconProps) => {
    useEffect(() => {
        const timer = setTimeout(onAnimationComplete, 2000);
        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <Animated.View entering={FadeIn.duration(800).delay(1000)}>
            <MaterialCommunityIcons
                name={name}
                size={size}
                color={color}
            />
        </Animated.View>
    );
}; 