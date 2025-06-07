import { View } from 'react-native';
import { ModalFooter } from './shared/ModalFooter';
import { InitialStep } from './steps/InitialStep';
import { SkuStep } from './steps/SkuStep';
import { FormStep } from './steps/FormStep';
import { ViewStep } from './steps/ViewStep';
import { Sneaker } from '@/types/Sneaker';
import { useModalStore } from '@/store/useModalStore';

interface SneakersModalProps {
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export const SneakersModal = ({ 
    userSneakers,
    setUserSneakers
}: SneakersModalProps) => {
    const { 
        modalStep, 
        isVisible, 
        currentSneaker,
        setSneakerFetchedInformation
    } = useModalStore();

    if (!isVisible) return null;

    return (
        <View className="flex-1">
            <View className="flex-1">
                {modalStep === 'index' && (
                    <InitialStep />
                )}

                {modalStep === 'sku' && (
                    <SkuStep />
                )}

                {modalStep === 'addForm' && (
                    <FormStep 
                        sneaker={currentSneaker}
                        setSneaker={setSneakerFetchedInformation}
                        userSneakers={userSneakers}
                        setUserSneakers={setUserSneakers}
                    />
                )}

                {modalStep === 'view' && currentSneaker && (
                    <ViewStep
                        sneaker={currentSneaker}
                        setSneaker={setSneakerFetchedInformation}
                        userSneakers={userSneakers}
                        setUserSneakers={setUserSneakers}
                    />
                )}
            </View>

            <ModalFooter />
        </View>
    );
};
