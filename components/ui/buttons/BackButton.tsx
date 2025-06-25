import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BackButton({onPressAction}: {onPressAction: () => void}) {
    return (
        <Pressable
            className="bg-white p-3 rounded-md flex items-center justify-center"
            onPress={() => {
                onPressAction();
            }}
            testID="back-button"
        >
            <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
    );
}