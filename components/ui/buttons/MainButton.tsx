import { Text } from 'react-native';
import useAnimatedButtons from '@/hooks/useAnimatedButtons';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

type MainButtonProps = {
    content: string;
    onPressAction: () => void;
    backgroundColor: string;
    isDisabled?: boolean;
    width?: 'full' | 'half';
}

export default function MainButton({content, onPressAction, backgroundColor, isDisabled = false, width = 'half'}: MainButtonProps) {
    const { animatedStyle, gesture } = useAnimatedButtons(isDisabled);

    return (
        <Animated.View
            className={`${backgroundColor} p-2 rounded-md ${width === 'full' ? 'w-full' : 'w-1/2'}`}
            style={animatedStyle}
            testID="main-button"
            accessibilityState={{ disabled: isDisabled }}
        >
            <GestureDetector gesture={gesture}>
                <Animated.View onTouchEnd={onPressAction}>
                    <Text className="font-open-sans-bold text-lg text-center text-white">
                        {content}
                    </Text>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
}