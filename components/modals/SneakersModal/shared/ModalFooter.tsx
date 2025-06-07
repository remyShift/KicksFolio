import { View } from 'react-native';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import { useModalStore } from '@/store/useModalStore';

export const ModalFooter = () => {
    const { modalStep, setModalStep, skuSearchCallback, setIsVisible } = useModalStore();

    const handleNext = () => {

		switch (modalStep) {
			case 'index':
				setModalStep('sku');
				break;
			case 'sku':
				if (skuSearchCallback) {
					skuSearchCallback();
				}
				break;
			case 'addForm':
				setModalStep('view');
				break;
			case 'view':
				setIsVisible(false);
				setModalStep('index');
				break;
		}
	}

	const handleBack = () => {
		switch (modalStep) {
			case 'sku':
				setModalStep('index');
				break;
			case 'addForm':
				setModalStep('index');
				break;
			case 'view':
				setModalStep('addForm');
				break;
		}
	}
    return (
        <View className="justify-end items-start w-full pb-5">
            {modalStep === 'sku' && (
                        <View className="flex-row justify-between w-full">
                            <BackButton 
                                onPressAction={handleBack} 
                            />
                            <NextButton
                                content="Search"
                                onPressAction={handleNext}
                            />
                        </View>
                )}
            {modalStep === 'addForm' && (
                        <View className="flex-row justify-between w-full">
                            <BackButton 
                                onPressAction={handleBack} 
                            />
                            <NextButton
                                content="Add"
                                onPressAction={handleNext}
                            />
                        </View>
                )}
        </View>
    );
};
