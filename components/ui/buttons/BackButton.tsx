import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export default function BackButton({onPressAction}: {onPressAction: () => void}) {
    return (
        <Pressable
            className="bg-white p-3 rounded-md flex items-center justify-center"
            onPress={() => {
                onPressAction();
            }}
        >
            <MaterialIcons name="arrow-back-ios-new" size={20} color="black" />
        </Pressable>
    );
}