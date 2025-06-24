import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AddButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable 
            style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
            }}
            className="bg-primary w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
            onPress={onPress}
            testID="add-button"
        >
            <FontAwesome name="plus" size={28} color="white" />
        </Pressable>
    );
}
