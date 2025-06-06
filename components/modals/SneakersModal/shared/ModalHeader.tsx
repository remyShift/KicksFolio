import { View, Text } from 'react-native';
import { ModalStep } from '../types';
import AntDesign from '@expo/vector-icons/AntDesign';

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
        <View className="flex-row justify-end py-2">
            <AntDesign name="close" size={24} color="black" />
        </View>
    );
};
