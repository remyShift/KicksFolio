import { Modal, Pressable, View } from 'react-native';
import { SneakersModal } from '@/components/modals/SneakersModal';
import { Sneaker } from '@/types/Sneaker';

interface SneakersModalWrapperProps {
    visible: boolean;
    onClose: () => void;
    sneaker: Sneaker | null;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export default function SneakersModalWrapper({
    visible,
    onClose,
    sneaker,
    userSneakers,
    setUserSneakers
}: SneakersModalWrapperProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable 
                className="flex-1 bg-black/50" 
                onPress={onClose}
            >
                <View className="flex-1 justify-end">
                    <Pressable 
                        className="h-[80%] bg-background rounded-t-3xl p-4"
                        onPress={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <SneakersModal 
                            isVisible={visible} 
                            onClose={onClose} 
                            userSneakers={userSneakers} 
                            setUserSneakers={setUserSneakers} 
                            sneaker={sneaker} 
                        />
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
} 