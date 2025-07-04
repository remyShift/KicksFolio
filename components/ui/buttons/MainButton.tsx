import { Text } from 'react-native';
import useAnimatedButtons from '@/hooks/useAnimatedButtons';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

type MainButtonProps = {
    content: string;
    onPressAction: () => void;
    backgroundColor: string;
    isDisabled?: boolean;
}

export default function MainButton({content, onPressAction, backgroundColor, isDisabled = false}: MainButtonProps) {
    const { animatedStyle, gesture } = useAnimatedButtons(isDisabled);

    return (
        <Animated.View
            className={`${backgroundColor} py-3 px-4 rounded-md w-1/2`}
            style={animatedStyle}
            testID="main-button"
        >
            <GestureDetector gesture={gesture}>
                <Animated.View onTouchEnd={onPressAction}>
                    <Text className="font-spacemono-bold text-lg text-center text-white">
                        {content}
                    </Text>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
}