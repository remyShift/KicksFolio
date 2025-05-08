import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AnimatedLogoProps {
    text: string;
    className?: string;
}

export const AnimatedLogo = ({ text, className = "text-white text-6xl font-bold font-actonia" }: AnimatedLogoProps) => {
    const letters = text.split('');

    return (
        <View className="flex-row">
            {letters.map((letter, index) => (
                <Animated.Text
                key={index}
                entering={FadeIn.duration(500).delay(index * 150)}
                exiting={FadeOut.duration(500)}
                className={className}
                style={{ marginRight: index < letters.length - 1 ? -12 : 0 }}
                >
                {letter}
                </Animated.Text>
            ))}
        </View>
    );
}; 