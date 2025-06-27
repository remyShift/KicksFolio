import useAnimatedButtons from "@/hooks/useAnimatedButtons";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabAddButton({handleAddPress, isDisabled = false}: {handleAddPress: () => void, isDisabled?: boolean}) {
    const { animatedStyle, handlePressIn, handlePressOut, AnimatedPressable } = useAnimatedButtons(isDisabled);

    return (
        <AnimatedPressable
        onPress={handleAddPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className="w-16 h-16 mb-12 rounded-full bg-orange-500 justify-center items-center"
        disabled={isDisabled}
    >
            <Ionicons name="add" size={38} color="white" />
        </AnimatedPressable>
    )
}
