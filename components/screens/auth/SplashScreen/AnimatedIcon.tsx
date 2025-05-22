import { useCallback, useEffect, useRef } from 'react';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface AnimatedIconProps {
    name: keyof typeof MaterialCommunityIcons.glyphMap;
    size: number;
    color: string;
    onAnimationComplete: () => void;
}

export const AnimatedIcon = ({ name, size, color, onAnimationComplete }: AnimatedIconProps) => {
    const hasAnimated = useSharedValue(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const AnimatedShoeIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

    const handleLayout = useCallback(() => {
        if (!hasAnimated.value) {
            hasAnimated.value = true;
            timeoutRef.current = setTimeout(onAnimationComplete, 2000);
        }
    }, [onAnimationComplete]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <AnimatedShoeIcon
            name={name}
            size={size}
            color={color}
            entering={FadeIn.duration(800).delay(1000)}
            exiting={FadeOut.duration(500)}
            onLayout={handleLayout}
        />
    );
}; 