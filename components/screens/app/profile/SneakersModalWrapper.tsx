import { Modal, Pressable, View } from 'react-native';
import { SneakersModal } from '@/components/modals/SneakersModal';
import { useModalStore } from '@/store/useModalStore';

export default function SneakersModalWrapper() {
    const { isVisible, setIsVisible } = useModalStore();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
        >
            <Pressable 
                className="flex-1 bg-black/50" 
                onPress={() => setIsVisible(false)}
            >
                <View className="flex-1 justify-end">
                    <Pressable 
                        className="h-[80%] bg-background rounded-t-3xl p-4"
                        onPress={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <SneakersModal />
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
} 