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
        fetchedSneaker,
        setCurrentSneaker
    } = useModalStore();

    const { sessionToken, userCollection } = useSession();
    const { handleSkuSearch, handleFormSubmit } = useSneakerAPI(sessionToken!, userCollection!.id);

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
                if (fetchedSneaker) {
                    handleFormSubmit(
                        {
                            model: fetchedSneaker.model,
                            brand: fetchedSneaker.brand,
                            status: '',
                            size: '',
                            condition: '',
                            images: [
                                {
                                    url: fetchedSneaker.image.url,
                                }
                            ],
                            price_paid: '',
                            description: fetchedSneaker.description
                        },
                        {
                            setCurrentSneaker,
                            setModalStep,
                            setErrorMsg
                        }
                    );
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
