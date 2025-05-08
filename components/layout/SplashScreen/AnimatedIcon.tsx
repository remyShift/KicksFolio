import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface AnimatedIconProps {
    name: keyof typeof MaterialCommunityIcons.glyphMap;
    size: number;
    color: string;
    onAnimationComplete: () => void;
}

export const AnimatedIcon = ({ name, size, color, onAnimationComplete }: AnimatedIconProps) => {
    const AnimatedShoeIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

    return (
        <AnimatedShoeIcon
            name={name}
            size={size}
            color={color}
            entering={FadeIn.duration(800).delay(1500)}
            exiting={FadeOut.duration(500)}
            onLayout={() => {
                setTimeout(onAnimationComplete, 3500);
            }}
        />
    );
}; 