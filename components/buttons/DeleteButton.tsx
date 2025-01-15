import { Pressable } from 'react-native';
import Feather from '@expo/vector-icons/build/Feather';

export default function DeleteButton({ onPressAction }: { onPressAction: () => void }) {
    return (
        <Pressable 
            className="bg-white p-3 rounded-md flex items-center justify-center"
            onPress={onPressAction}
        >
            <Feather name="trash-2" size={24} color="red" />
        </Pressable>
    );
}