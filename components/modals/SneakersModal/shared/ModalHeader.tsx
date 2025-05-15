import { View, Text } from 'react-native';
import { ModalStep } from '../types';

interface ModalHeaderProps {
    currentStep: ModalStep;
    onClose: () => void;
}

export const ModalHeader = ({ currentStep, onClose }: ModalHeaderProps) => {
    const getTitle = () => {
        switch (currentStep) {
            case 'index':
                return 'Add Sneakers';
            case 'sku':
                return 'Enter SKU';
            case 'addForm':
                return 'Add Details';
            case 'view':
                return 'Sneaker Details';
            default:
                return 'Add Sneakers';
        }
    };

    return (
        <View className="flex-row justify-between items-center px-4 py-2 border-b border-gray-200">
            <Text className="font-spacemono-bold text-lg">{getTitle()}</Text>
            <Text 
                className="font-spacemono text-base text-blue-500"
                onPress={onClose}
            >
                Close
            </Text>
        </View>
    );
};
