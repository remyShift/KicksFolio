import { View } from 'react-native';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import EditButton from '@/components/ui/buttons/EditButton';
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
        sneakerToAdd,
        validateForm,
        currentSneaker
    } = useModalStore();

    const { sessionToken, user } = useSession();
    const { handleSkuSearch, handleFormSubmit, handleFormUpdate, handleNext, handlePrevious } = useSneakerAPI(sessionToken!, user!.id);

    const handleNextAction = () => {
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
                if (validateForm && sneakerToAdd) {
                    validateForm()
                        .then((result) => {
                            if (result.isValid) {
                                handleFormSubmit({
                                    model: sneakerToAdd.model,
                                    brand: sneakerToAdd.brand,
                                    status: sneakerToAdd.status,
                                    size: sneakerToAdd.size,
                                    condition: sneakerToAdd.condition,
                                    images: sneakerToAdd.images && sneakerToAdd.images.length > 0 ? [
                                        {
                                            url: sneakerToAdd.images[0]?.url || '',
                                        }
                                    ] : [],
                                    price_paid: sneakerToAdd?.price_paid || '',
                                    description: sneakerToAdd?.description || ''
                                }, {
                                    setCurrentSneaker,
                                    setModalStep,
                                    setErrorMsg
                                });
                            }
                        })
                        .catch((error) => {
                            setErrorMsg('Une erreur est survenue lors de la validation');
                        });
                }
                break;
            case 'editForm':
                if (validateForm && sneakerToAdd && currentSneaker) {
                    validateForm()
                        .then((result) => {
                            if (result.isValid) {
                                handleFormUpdate(currentSneaker.id, {
                                    model: sneakerToAdd.model,
                                    brand: sneakerToAdd.brand,
                                    status: sneakerToAdd.status,
                                    size: sneakerToAdd.size,
                                    condition: sneakerToAdd.condition,
                                    images: sneakerToAdd.images && sneakerToAdd.images.length > 0 ? [
                                        {
                                            url: sneakerToAdd.images[0]?.url || '',
                                        }
                                    ] : [],
                                    price_paid: sneakerToAdd?.price_paid || '',
                                    description: sneakerToAdd?.description || ''
                                }, {
                                    setCurrentSneaker,
                                    setModalStep,
                                    setErrorMsg
                                });
                            }
                        })
                        .catch((error) => {
                            setErrorMsg('Une erreur est survenue lors de la validation');
                        });
                }
                break;
            case 'view':
                handleNext(currentSneaker, setCurrentSneaker);
                break;
        }
    }

    const handleBackAction = () => {
        switch (modalStep) {
            case 'sku':
                setModalStep('index');
                break;
            case 'addForm':
                setModalStep('index');
                break;
            case 'editForm':
                setModalStep('view');
                break;
            case 'view':
                handlePrevious(currentSneaker, setCurrentSneaker);
                break;
        }
    }

    const handleEditAction = () => {
        setModalStep('editForm');
    }

    return (
        <View className="justify-end items-start w-full pb-5">
            {modalStep === 'sku' && (
                <View className="flex-row justify-between w-full">
                    <BackButton 
                        onPressAction={handleBackAction} 
                    />
                    <NextButton
                        content="Search"
                        onPressAction={handleNextAction}
                    />
                </View>
            )}
            {modalStep === 'addForm' && (
                <View className="flex-row justify-between w-full">
                    <BackButton 
                        onPressAction={handleBackAction} 
                    />
                    <NextButton
                        content="Add"
                        onPressAction={handleNextAction}
                    />
                </View>
            )}
            {modalStep === 'editForm' && (
                <View className="flex-row justify-between w-full">
                    <BackButton 
                        onPressAction={handleBackAction} 
                    />
                    <NextButton
                        content="Update"
                        onPressAction={handleNextAction}
                    />
                </View>
            )}
            {modalStep === 'view' && (
                <View className="flex-row justify-between w-full">
                    <View className="flex flex-row gap-3">
                        <BackButton 
                            onPressAction={handleBackAction}
                        />
                        <EditButton 
                            onPressAction={handleEditAction}
                        />
                    </View>

                    <NextButton 
                        content="Next" 
                        onPressAction={handleNextAction}
                    />
                </View>
            )}
        </View>
    );
};
