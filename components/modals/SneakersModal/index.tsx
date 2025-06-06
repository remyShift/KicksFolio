import { View } from 'react-native';
import { ModalHeader } from './shared/ModalHeader';
import { ModalFooter } from './shared/ModalFooter';
import { InitialStep } from './steps/InitialStep';
import { SkuStep } from './steps/SkuStep';
import { FormStep } from './steps/FormStep';
import { ViewStep } from './steps/ViewStep';
import { Sneaker } from '@/types/Sneaker';
import { useModalStore } from '@/store/useModalStore';
import { useSession } from '@/context/authContext';
import { useEffect } from 'react';

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
        setSneakerFetchedInformation,
        handleNext,
        handleBack,
    } = useModalStore();

    if (!isVisible) return null;

    return (
        <View className="flex-1">
            <ModalHeader />

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

            <ModalFooter 
                currentStep={modalStep}
                onBack={handleBack}
                onNext={handleNext}
            />
        </View>
    );
};
