import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDownScaleAnimation } from '@/hooks';
import Feather from '@expo/vector-icons/build/Feather';

export default function DeleteButton({ onPressAction }: { onPressAction: () => void }) {
    const { scale, triggerAnimation } = useDownScaleAnimation();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const handlePress = () => {
        triggerAnimation();
        onPressAction();
    };

    return (
        <Pressable 
            className="bg-white p-3 rounded-md flex items-center justify-center"
            onPress={handlePress}
        >
            <Animated.View style={animatedStyle}>
                <Feather name="trash-2" size={24} color="red" />
            </Animated.View>
        </Pressable>
    );
}