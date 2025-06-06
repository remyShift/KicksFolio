import { View, Text, Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useModalStore } from '@/store/useModalStore';

export const ModalHeader = () => {
    const { setIsVisible } = useModalStore();

    return (
        <View className="flex-row justify-end py-2">
            <Pressable onPress={() => setIsVisible(false)}>
                <AntDesign name="close" size={24} color="black" />
            </Pressable>
        </View>
    );
};
