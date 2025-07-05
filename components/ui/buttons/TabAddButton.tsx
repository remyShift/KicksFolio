import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Pressable } from "react-native";

export default function TabAddButton({handleAddPress, isDisabled = false}: {handleAddPress: () => void, isDisabled?: boolean}) {
    console.log('[TabAddButton] Component rendering');
    
    return (
        <View className="w-16 h-16 mb-12 rounded-full bg-orange-500 justify-center items-center">
            <Pressable onPress={handleAddPress} disabled={isDisabled}>
                <Ionicons name="add" size={38} color="white" />
            </Pressable>
        </View>
    )
}
