import { View, Text, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import EditButton from '@/components/ui/buttons/EditButton';
import ShareButton from '@/components/ui/buttons/ShareButton';
import { ConditionBar } from '@/components/ui/indicators/ConditionBar';
import { Sneaker } from '@/types/Sneaker';
import { useSession } from '@/context/authContext';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useState } from 'react';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useModalStore } from '@/store/useModalStore';

export const ViewStep = () => {
    const { currentSneaker, setCurrentSneaker } = useModalStore();

    const { sessionToken, user, userSneakers, setUserSneakers } = useSession();
    const { handleSneakerDelete } = useSneakerAPI(sessionToken!, user!.id);
    const [errorMsg, setErrorMsg] = useState('');
    const { setModalStep, setIsVisible } = useModalStore();

    const currentSneakerId = userSneakers ? userSneakers.find((s: Sneaker) => s.id === currentSneaker?.id)?.id : null;

    const handleNext = () => {
        if (!userSneakers || !currentSneakerId) return;
        const currentIndex = userSneakers.findIndex((s: Sneaker) => s.id === currentSneakerId);
        const nextId = currentIndex < userSneakers.length - 1 
            ? userSneakers[currentIndex + 1].id 
            : userSneakers[0].id;
        const nextSneaker = userSneakers.find((s: Sneaker) => s.id === nextId);
        if (!nextSneaker) return;
        setCurrentSneaker(nextSneaker);
    };

    const handleDelete = () => {
        if (!currentSneaker?.id) return;

        Alert.alert('Delete sneaker', 'Are you sure you want to delete this sneaker ?', [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    handleSneakerDelete(currentSneaker.id)
                        .then(() => {
                            setCurrentSneaker(null);
                            setIsVisible(false);
                            setUserSneakers(userSneakers?.filter(s => s.id !== currentSneaker.id) || []);
                        })
                        .catch((error) => {
                            setErrorMsg(`An error occurred while deleting the sneaker: ${error}`);
                        });
                }
            }
        ]);
    };

    return (
        <View className="flex-1 gap-4">
            <ErrorMsg content={errorMsg} display={errorMsg !== ''}/>
            
            <Image 
                source={{ uri: currentSneaker?.images?.[0]?.url }} 
                style={{
                    width: '100%',
                    height: 170,
                    borderRadius: 3
                }}
                contentFit="cover"
                contentPosition="center"
                cachePolicy="memory-disk"
            />

            <View className="flex-row justify-between items-center px-2">
                <View className="flex gap-0">
                    <Text className="font-spacemono-bold text-lg">{currentSneaker?.model}</Text>
                    <Text className="font-spacemono-bold-italic text-base">{currentSneaker?.brand}</Text>
                </View>
                <ShareButton />
            </View>

            <View className='flex gap-8'>
                <View className="flex-row items-center w-full border-t-2 border-gray-300">
                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Size</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-xl text-center">{currentSneaker?.size}US</Text>
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Status</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-xl text-center">{currentSneaker?.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3'>
                        <Text className='font-spacemono text-center text-sm'>Price Paid</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-xl text-center">
                                {currentSneaker?.price_paid ? currentSneaker?.price_paid + '$' : 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                <ConditionBar condition={currentSneaker?.condition || 0} />

                <View className="flex-1 items-center w-full">
                    <ScrollView 
                        className="bg-white/60 rounded-md p-2 w-full"
                        showsVerticalScrollIndicator={true}
                        indicatorStyle="black"
                        persistentScrollbar={true}
                        style={{
                            minHeight: 180,
                            maxHeight: 180
                        }}
                    >
                        <Text className='font-spacemono-bold'>Description :</Text>
                        <Text className='font-spacemono text-sm'>
                            {currentSneaker?.description || 'No description available'}
                        </Text>
                    </ScrollView>
                </View>
            </View>

            <View className="flex-1 justify-end pb-5 px-2">
                <View className="flex-row justify-between w-full">
                    <View className="flex flex-row gap-3">
                        <BackButton 
                            onPressAction={() => {
                                setModalStep('index');
                                setIsVisible(false);
                            }}
                        />
                        <EditButton 
                            onPressAction={() => {
                                setModalStep('addForm');
                            }}
                        />
                    </View>

                    <NextButton 
                        content="Next" 
                        onPressAction={handleNext}
                    />
                </View>
            </View>
        </View>
    );
};
