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

interface AddSneakersModalProps {
    isVisible: boolean;
    onClose: () => void;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export const AddSneakersModal = ({ 
    isVisible, 
    onClose, 
    userSneakers,
    setUserSneakers 
}: AddSneakersModalProps) => {
    const [currentStep, setCurrentStep] = useState<ModalStep>('index');
    const [sneaker, setSneaker] = useState<Sneaker | null>(null);

    const handleBack = () => {
        switch (currentStep) {
            case 'sku':
            case 'addForm':
                setCurrentStep('index');
                break;
            case 'view':
                setCurrentStep('index');
                break;
            default:
                onClose();
        }
    };

    const handleNext = () => {
        switch (currentStep) {
            case 'index':
                // This will be handled by the InitialStep component
                break;
            case 'sku':
                // This will be handled by the SkuStep component
                break;
            case 'addForm':
                setCurrentStep('view');
                break;
            case 'view':
                // This will be handled by the ViewStep component
                break;
        }
    };

    if (!isVisible) return null;

    return (
        <View className="flex-1 bg-white">
            <ModalHeader 
                currentStep={currentStep}
                onClose={onClose}
            />

            <View className="flex-1">
                {currentStep === 'index' && (
                    <InitialStep 
                        setModalStep={setCurrentStep}
                        closeModal={onClose}
                    />
                )}

                {currentStep === 'sku' && (
                    <SkuStep 
                        setModalStep={setCurrentStep}
                        closeModal={onClose}
                        setSneaker={setSneaker}
                    />
                )}

                {currentStep === 'addForm' && (
                    <FormStep 
                        setModalStep={setCurrentStep}
                        closeModal={onClose}
                        sneaker={sneaker}
                        setSneaker={setSneaker}
                        userSneakers={userSneakers}
                        setUserSneakers={setUserSneakers}
                    />
                )}

                {currentStep === 'view' && sneaker && (
                    <ViewStep
                        setModalStep={setCurrentStep}
                        closeModal={onClose}
                        sneaker={sneaker}
                        setSneaker={setSneaker}
                        userSneakers={userSneakers}
                        setUserSneakers={setUserSneakers}
                    />
                )}
            </View>

            <ModalFooter 
                currentStep={currentStep}
                onBack={handleBack}
                onNext={handleNext}
            />
        </View>
    );
};
