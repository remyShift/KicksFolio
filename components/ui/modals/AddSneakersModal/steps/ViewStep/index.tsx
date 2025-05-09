import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ModalStep } from '../../types';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import EditButton from '@/components/ui/buttons/EditButton';
import ShareButton from '@/components/ui/buttons/ShareButton';
import { ConditionBar } from '@/components/ui/indicators/ConditionBar';
import { Sneaker } from '@/types/Sneaker';

interface ViewStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    sneaker: Sneaker;
    setSneaker: (sneaker: Sneaker | null) => void;
    userSneakers: Sneaker[] | null;
}

export const ViewStep = ({ setModalStep, closeModal, sneaker, setSneaker, userSneakers }: ViewStepProps) => {
    const currentSneakerId = userSneakers ? userSneakers.find((s: Sneaker) => s.id === sneaker?.id)?.id : null;

    const handleNext = () => {
        if (!userSneakers || !currentSneakerId) return;
        const currentIndex = userSneakers.findIndex((s: Sneaker) => s.id === currentSneakerId);
        const nextId = currentIndex < userSneakers.length - 1 
            ? userSneakers[currentIndex + 1].id 
            : userSneakers[0].id;
        const nextSneaker = userSneakers.find((s: Sneaker) => s.id === nextId);
        if (!nextSneaker) return;
        setSneaker(nextSneaker);
    };

    return (
        <View className="flex-1 gap-4">
            <Image 
                source={{ uri: sneaker?.images?.[0]?.url }} 
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
                    <Text className="font-spacemono-bold text-lg">{sneaker?.model}</Text>
                    <Text className="font-spacemono-bold-italic text-base">{sneaker?.brand}</Text>
                </View>
                <ShareButton />
            </View>

            <View className='flex gap-8'>
                <View className="flex-row items-center w-full border-t-2 border-gray-300">
                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Size</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-xl text-center">{sneaker?.size}US</Text>
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Status</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-xl text-center">{sneaker?.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3'>
                        <Text className='font-spacemono text-center text-sm'>Price Paid</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-xl text-center">
                                {sneaker?.price_paid ? sneaker?.price_paid + '$' : 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                <ConditionBar condition={sneaker?.condition || 0} />

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
                            {sneaker?.description || 'No description available'}
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
                                closeModal();
                            }}
                        />
                        <EditButton 
                            onPressAction={() => {
                                setModalStep('noBox');
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
