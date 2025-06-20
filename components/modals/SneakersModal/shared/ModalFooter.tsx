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
        validateForm,
        currentSneaker,
        resetModalData
    } = useModalStore();

    const { user, userSneakers } = useSession();

    if (!user) return null;

    const { handleSkuSearch, handleFormSubmit, handleFormUpdate, handleNext, handlePrevious, handleSneakerDelete } = useSneakerAPI(user.id);

    const [nextSneaker, setNextSneaker] = useState<Sneaker | null>(null);
    const [prevSneaker, setPrevSneaker] = useState<Sneaker | null>(null);

    useEffect(() => {
        if (modalStep === 'view' && userSneakers && currentSneaker) {
            const currentIndex = userSneakers.findIndex((s: Sneaker) => s.id === currentSneaker.id);
            
            if (currentIndex !== -1) {
                const nextIndex = (currentIndex + 1) % userSneakers.length;
                setNextSneaker(userSneakers[nextIndex]);

                const prevIndex = (currentIndex - 1 + userSneakers.length) % userSneakers.length;
                setPrevSneaker(userSneakers[prevIndex]);
            }
        }

        return () => {
            setNextSneaker(null);
            setPrevSneaker(null);
        }
    }, [currentSneaker, modalStep, userSneakers]);

    const handleNextAction = () => {
        switch (modalStep) {
            case 'index':
                setErrorMsg('');
                setModalStep('sku');
                break;
            case 'sku':
                if (!sneakerSKU.trim()) {
                    setErrorMsg('Please enter a SKU.');
                    return;
                }
                setErrorMsg('');
                handleSkuSearch(sneakerSKU, {
                    setFetchedSneaker,
                    setModalStep,
                    setErrorMsg
                });
                break;
            case 'addForm':
                if (validateForm) {
                    validateForm()
                        .then((result) => {
                            if (result.isValid && result.data) {
                                handleFormSubmit({
                                    model: result.data.model,
                                    brand: result.data.brand,
                                    status: result.data.status,
                                    size: result.data.size,
                                    condition: result.data.condition,
                                    images: result.data.images && result.data.images.length > 0 ? [
                                        {
                                            url: result.data.images[0]?.url || '',
                                        }
                                    ] : [],
                                    price_paid: result.data?.price_paid || '',
                                    description: result.data?.description || ''
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
                if (validateForm && currentSneaker) {
                    validateForm()
                        .then((result) => {
                            if (result.isValid && result.data) {
                                handleFormUpdate(currentSneaker.id, {
                                    model: result.data.model,
                                    brand: result.data.brand,
                                    status: result.data.status,
                                    size: result.data.size,
                                    condition: result.data.condition,
                                    images: result.data.images && result.data.images.length > 0 ? [
                                        {
                                            url: result.data.images[0]?.url || '',
                                        }
                                    ] : [],
                                    price_paid: result.data?.price_paid || '',
                                    description: result.data?.description || ''
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
                } else {
                    if (!validateForm) setErrorMsg('validateForm is missing');
                    if (!currentSneaker) setErrorMsg('currentSneaker is missing');
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
                setErrorMsg('');
                setModalStep('index');
                break;
            case 'addForm':
                resetModalData();
                setModalStep('index');
                break;
            case 'editForm':
                setErrorMsg('');
                setModalStep('view');
                break;
            case 'view':
                if (prevSneaker) {
                    handlePrevious(prevSneaker, setCurrentSneaker);
                } else {
                    resetModalData();
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
                                resetModalData();
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
                        testID="search"
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
                        testID="add"
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
                            testID="delete"
                        />
                    </View>

                    <NextButton 
                        content="Edit" 
                        onPressAction={handleNextAction}
                        testID="edit"
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
                            testID="edit-button"
                        />
                    </View>

                    <NextButton 
                        content="Next" 
                        onPressAction={handleNextAction}
                        testID="next"
                    />
                </View>
            )}
        </View>
    );
};
