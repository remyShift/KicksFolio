import { useState } from 'react';
import { View } from 'react-native';
import { ModalHeader } from './shared/ModalHeader';
import { ModalFooter } from './shared/ModalFooter';
import { InitialStep } from './steps/InitialStep';
import { SkuStep } from './steps/SkuStep';
import { FormStep } from './steps/FormStep';
import { ViewStep } from './steps/ViewStep';
import { Sneaker } from '@/types/Sneaker';
import { useModalStore } from '@/store/useModalStore';

interface SneakersModalProps {
    sneaker: Sneaker | null;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export const SneakersModal = ({ 
    sneaker,
    userSneakers,
    setUserSneakers
}: SneakersModalProps) => {
    const { 
        modalStep, 
        isVisible, 
        currentSneaker,
        errorMsg,
        setCurrentSneaker,
        setSneakerSKU,
        handleNext,
        handleBack
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
                    <SkuStep 
                        setSneaker={setCurrentSneaker}
                        setSku={setSneakerSKU}
                        errorMsg={errorMsg}
                    />
                )}

                {modalStep === 'addForm' && (
                    <FormStep 
                        sneaker={currentSneaker}
                        setSneaker={setCurrentSneaker}
                        userSneakers={userSneakers}
                        setUserSneakers={setUserSneakers}
                        errorMsg={errorMsg}
                    />
                )}

                {modalStep === 'view' && currentSneaker && (
                    <ViewStep
                        sneaker={currentSneaker}
                        setSneaker={setCurrentSneaker}
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
