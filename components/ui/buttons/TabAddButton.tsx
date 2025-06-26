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
        className="w-14 h-14 mb-12 rounded-full bg-orange-500 justify-center items-center"
        disabled={isDisabled}
    >
            <Ionicons name="add" size={34} color="white" />
        </AnimatedPressable>
    )
}
