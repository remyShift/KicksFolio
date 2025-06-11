import { Alert, View } from 'react-native';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import EditButton from '@/components/ui/buttons/EditButton';
import { useModalStore } from '@/store/useModalStore';
import { useSneakerAPI } from '../hooks/useSneakerAPI';
import { useSession } from '@/context/authContext';
import DeleteButton from '@/components/ui/buttons/DeleteButton';
import { Sneaker } from '@/types/Sneaker';
import { useEffect, useState } from 'react';

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

    const { sessionToken, user, userSneakers } = useSession();
    const { handleSkuSearch, handleFormSubmit, handleFormUpdate, handleNext, handlePrevious, handleSneakerDelete } = useSneakerAPI(sessionToken!, user!.id);

    const [nextSneaker, setNextSneaker] = useState<Sneaker | null>(null);
    const [prevSneaker, setPrevSneaker] = useState<Sneaker | null>(null);

    useEffect(() => {
        if (modalStep === 'view') {
            setNextSneaker(userSneakers?.find((s: Sneaker) => s.id === (currentSneaker?.id ? parseInt(currentSneaker.id) + 1 : 0).toString()) || null);
            setPrevSneaker(userSneakers?.find((s: Sneaker) => s.id === (currentSneaker?.id ? parseInt(currentSneaker.id) - 1 : 0).toString()) || null);
        }

        return () => {
            setNextSneaker(null);
            setPrevSneaker(null);
        }
    }, [currentSneaker, modalStep]);

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
                console.log('sneakerToAdd', sneakerToAdd);
                if (validateForm && sneakerToAdd) {
                    validateForm()
                        .then((result) => {
                            console.log('result', result);
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
                            } else {
                                setErrorMsg(result.errorMsg);
                            }
                        })
                        .catch((error) => {
                            setErrorMsg('An error occurred while validating the sneaker : ' + error);
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
                        .catch(() => {
                            setErrorMsg('Une erreur est survenue lors de la validation');
                        });
                }
                break;
            case 'view':
                if (nextSneaker) {
                handleNext(nextSneaker, setCurrentSneaker);
                } else {
                    setIsVisible(false);
                }
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
                if (prevSneaker) {
                    handlePrevious(prevSneaker, setCurrentSneaker);
                } else {
                    setIsVisible(false);
                }
                break;
        }
    }

    const handleEditAction = () => {
        setModalStep('editForm');
    }

    const handleDeleteAction = () => {
        if (currentSneaker?.id) {
            Alert.alert('Are you sure you want to delete this sneaker?', 'This action cannot be undone.', [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        handleSneakerDelete(currentSneaker.id)
                            .then(() => {
                                setModalStep('index');
                                setIsVisible(false);
                                setCurrentSneaker(null);
                            })
                            .catch(() => {
                                setErrorMsg('An error occurred while deleting the sneaker.');
                            });
                    },
                },
            ]);
        }
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
                    <View className="flex flex-row gap-3">
                        <BackButton 
                            onPressAction={handleBackAction}
                        />
                        <DeleteButton 
                            onPressAction={handleDeleteAction}
                        />
                    </View>

                    <NextButton 
                        content="Next" 
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
