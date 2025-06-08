import { View } from 'react-native';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import { useModalStore } from '@/store/useModalStore';
import { useSneakerAPI } from '../hooks/useSneakerAPI';
import { useSession } from '@/context/authContext';

export const ModalFooter = () => {
    const { 
        modalStep, 
        setModalStep, 
        setIsVisible, 
        sneakerSKU,
        setFetchedSneaker,
        setErrorMsg,
        setCurrentSneaker,
        sneakerToAdd
    } = useModalStore();

    const { sessionToken, user } = useSession();
    const { handleSkuSearch, handleFormSubmit } = useSneakerAPI(sessionToken!, user!.id);

    const handleNext = () => {
        switch (modalStep) {
            case 'index':
                setModalStep('sku');
                break;
            case 'sku':
                handleSkuSearch(sneakerSKU, {
                    setFetchedSneaker,
                    setModalStep,
                    setErrorMsg
                });
                break;
            case 'addForm':
                if (sneakerToAdd) {
                    handleFormSubmit({
                            model: sneakerToAdd.model,
                            brand: sneakerToAdd.brand,
                            status: sneakerToAdd.status,
                            size: sneakerToAdd.size,
                            condition: sneakerToAdd.condition,
                            images: [
                                {
                                    url: sneakerToAdd.images[0].url,
                                }
                            ],
                            price_paid: sneakerToAdd?.price_paid || '',
                            description: sneakerToAdd?.description || ''
                        }, {
                            setCurrentSneaker,
                            setModalStep,
                            setErrorMsg
                        });
                }
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
