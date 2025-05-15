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
    isNextDisabled = false,
    nextButtonText = 'Next'
}: ModalFooterProps) => {
    const showBackButton = currentStep !== 'index';

    return (
        <View className="flex-row justify-between items-center px-4 py-2 border-t border-gray-200">
            {showBackButton && (
                <BackButton onPressAction={onBack} />
            )}
            <View className="flex-1" />
            <NextButton 
                content={nextButtonText}
                onPressAction={onNext}
                disabled={isNextDisabled}
            />
        </View>
    );
};
