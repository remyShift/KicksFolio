import { Modal, Pressable, View } from 'react-native';
import { SneakersModal } from '@/components/modals/SneakersModal';
import { Sneaker } from '@/types/Sneaker';
import { useModalStore } from '@/store/useModalStore';

interface SneakersModalWrapperProps {
    sneaker: Sneaker | null;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export default function SneakersModalWrapper({
    sneaker,
    userSneakers,
    setUserSneakers
}: SneakersModalWrapperProps) {
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
                        <SneakersModal 
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