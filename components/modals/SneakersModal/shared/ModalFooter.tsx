import { View } from 'react-native';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import EditButton from '@/components/ui/buttons/EditButton';
import { useModalStore } from '@/store/useModalStore';
import { useSession } from '@/context/authContext';
import DeleteButton from '@/components/ui/buttons/DeleteButton';
import { Sneaker } from '@/types/Sneaker';
import { useEffect } from 'react';
import { useModalFooterActions } from '../hooks/useModalFooterActions';

export const ModalFooter = () => {
    const { 
        modalStep, 
        currentSneaker,
    } = useModalStore();

    const { user, userSneakers } = useSession();
    const { handleBackAction, handleNextAction, handleEditAction, handleDeleteAction, setNextSneaker, setPrevSneaker, isLoading } = useModalFooterActions();

    if (!user) return null;

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

    return (
        <View className="justify-end items-start w-full pb-6">
            {modalStep === 'sku' && (
                <View className="flex-row justify-between w-full">
                    <BackButton 
                        onPressAction={handleBackAction}
                    />
                    <NextButton
                        content="Search"
                        onPressAction={() => {
                            if (!isLoading) {
                                handleNextAction();
                            }
                        }}
                        disabled={isLoading}
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
                        onPressAction={() => {
                            if (!isLoading) {
                                handleNextAction();
                            }
                        }}
                        disabled={isLoading}
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
                        onPressAction={() => {
                            if (!isLoading) {
                                handleNextAction();
                            }
                        }}
                        disabled={isLoading}
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
