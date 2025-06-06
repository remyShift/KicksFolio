import { useState } from 'react';
import { View } from 'react-native';
import { ModalStep } from './types';
import { ModalHeader } from './shared/ModalHeader';
import { ModalFooter } from './shared/ModalFooter';
import { InitialStep } from './steps/InitialStep';
import { SkuStep } from './steps/SkuStep';
import { FormStep } from './steps/FormStep';
import { ViewStep } from './steps/ViewStep';
import { Sneaker } from '@/types/Sneaker';
import { useStepModalStore } from '@/store/useStepModalStore';

interface SneakersModalProps {
    sneaker: Sneaker | null;
    isVisible: boolean;
    onClose: () => void;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export const SneakersModal = ({ 
    sneaker,
    isVisible,
    onClose, 
    userSneakers,
    setUserSneakers
}: SneakersModalProps) => {
    const { modalStep, setModalStep } = useStepModalStore();
    const [currentSneaker, setCurrentSneaker] = useState<Sneaker | null>(sneaker);

    const handleBack = () => {
        switch (modalStep) {
            case 'sku':
            case 'addForm':
                setModalStep('index');
                break;
            case 'view':
                setModalStep('index');
                break;
            default:
                onClose();
        }
    };

    const handleNext = () => {
        switch (modalStep) {
            case 'index':
                setModalStep('sku');
                break;
            case 'sku':
                setModalStep('addForm');
                break;
            case 'addForm':
                setModalStep('view');
                break;
            case 'view':
                onClose();
                break;
        }
    };

    if (!isVisible) return null;

    return (
        <View className="flex-1">
            <ModalHeader 
                currentStep={modalStep}
                onClose={onClose}
            />

            <View className="flex-1">
                {modalStep === 'index' && (
                    <InitialStep 
                        setModalStep={setModalStep}
                        closeModal={onClose}
                    />
                )}

                {modalStep === 'sku' && (
                    <SkuStep 
                        setModalStep={setModalStep}
                        closeModal={onClose}
                        setSneaker={setCurrentSneaker}
                    />
                )}

                {modalStep === 'addForm' && (
                    <FormStep 
                        setModalStep={setModalStep}
                        closeModal={onClose}
                        sneaker={currentSneaker}
                        setSneaker={setCurrentSneaker}
                        userSneakers={userSneakers}
                        setUserSneakers={setUserSneakers}
                    />
                )}

                {modalStep === 'view' && currentSneaker && (
                    <ViewStep
                        setModalStep={setModalStep}
                        closeModal={onClose}
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
