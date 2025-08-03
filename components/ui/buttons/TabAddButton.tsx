import useAnimatedButtons from "@/hooks/ui/useAnimatedButtons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from 'react-native-reanimated';

export default function TabAddButton({handleAddPress, isDisabled = false}: {handleAddPress: () => void, isDisabled?: boolean}) {
    const { animatedStyle, gesture } = useAnimatedButtons(isDisabled);

    return (
        <Animated.View
            style={animatedStyle}
            className="w-16 h-16 mb-12 rounded-full bg-orange-500 justify-center items-center"
        >
            <GestureDetector gesture={gesture}>
                <Animated.View onTouchEnd={handleAddPress}>
                    <Ionicons name="barcode-outline" size={32} color="white" />
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    )
}
