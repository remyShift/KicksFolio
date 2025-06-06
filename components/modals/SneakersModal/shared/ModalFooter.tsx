import { View } from 'react-native';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import { ModalStep } from '../types';

interface ModalFooterProps {
    currentStep: ModalStep;
    onBack: () => void;
    onNext: () => void;
    isNextDisabled?: boolean;
    nextButtonText?: string;
}

export const ModalFooter = ({ 
    currentStep, 
    onBack, 
    onNext,
}: ModalFooterProps) => {
    return (
        <View className="justify-end items-start w-full pb-5">
            {currentStep === 'sku' && (
                        <View className="flex-row justify-between w-full">
                            <BackButton 
                                onPressAction={onBack} 
                            />
                            <NextButton
                                content="Search"
                                onPressAction={onNext}
                            />
                        </View>
                )}
            {currentStep === 'addForm' && (
                        <View className="flex-row justify-between w-full">
                            <BackButton 
                                onPressAction={onBack} 
                            />
                            <NextButton
                                content="Add"
                                onPressAction={onNext}
                            />
                        </View>
                )}
        </View>
    );
};
