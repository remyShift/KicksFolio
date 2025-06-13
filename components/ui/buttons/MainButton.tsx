import { Pressable, Text } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    withSpring,
    useSharedValue 
} from 'react-native-reanimated';


type MainButtonProps = {
    content: string;
    onPressAction: () => void;
    backgroundColor: string;
    isDisabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MainButton({content, onPressAction, backgroundColor, isDisabled = false}: MainButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handlePressIn = () => {
        if (isDisabled) return;

        scale.value = withSpring(0.95, {
            damping: 10,
            stiffness: 100
        });
    };

    const handlePressOut = () => {
        if (isDisabled) return;

        scale.value = withSpring(1, {
            damping: 10,
            stiffness: 100
        });
    };

    return (
        <AnimatedPressable 
            className={`${backgroundColor} py-3 px-4 rounded-md w-1/2`}
            onPress={onPressAction}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={animatedStyle}
            disabled={isDisabled}
            testID="main-button"
        >
            <Text className="font-spacemono-bold text-lg text-center text-white">
                {content}
            </Text>
        </AnimatedPressable>
    );
}