import { Text } from 'react-native';
import useAnimatedButtons from '@/hooks/useAnimatedButtons';

type MainButtonProps = {
    content: string;
    onPressAction: () => void;
    backgroundColor: string;
    isDisabled?: boolean;
}

export default function MainButton({content, onPressAction, backgroundColor, isDisabled = false}: MainButtonProps) {
    const { animatedStyle, handlePressIn, handlePressOut, AnimatedPressable } = useAnimatedButtons(isDisabled);

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