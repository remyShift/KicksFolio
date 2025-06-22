import { View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ConditionBar } from '@/components/ui/indicators/ConditionBar';
import { useState } from 'react';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useModalStore } from '@/store/useModalStore';

export const ViewStep = () => {
    const { currentSneaker } = useModalStore();
    const [errorMsg, setErrorMsg] = useState('');

    if (!currentSneaker) {
        return null;
    }

    return (
        <View className="flex-1 gap-4">
            <ErrorMsg content={errorMsg} display={errorMsg !== ''}/>
            
            <Image 
                source={{ uri: currentSneaker.images?.[0]?.url }} 
                style={{
                    width: '100%',
                    height: 170,
                    borderRadius: 3
                }}
                contentFit="cover"
                contentPosition="center"
                cachePolicy="memory-disk"
                onError={(error) => {
                    setErrorMsg(`Failed to load image: ${error}`);
                }}
            />

            <View className="flex-row justify-between items-center px-2">
                <View className="flex gap-0">
                    <Text testID="sneaker-display-name" className="font-spacemono-bold text-lg">{currentSneaker.model}</Text>
                    <Text className="font-spacemono-bold-italic text-base">{currentSneaker.brand.toUpperCase()}</Text>
                </View>
            </View>

            <View className='flex gap-8'>
                <View className="flex-row items-center w-full border-t-2 border-gray-300">
                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Size</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-lg text-center">{currentSneaker.size}US</Text>
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Status</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-lg text-center">{currentSneaker.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3'>
                        <Text className='font-spacemono text-center text-sm'>Price Paid</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-lg text-center">
                                {currentSneaker.price_paid ? currentSneaker.price_paid + '$' : 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                <ConditionBar condition={currentSneaker.condition} />

                <View style={{ height: 150 }} className="bg-white/60 rounded-md p-2 mt-2">
                    <Text className='font-spacemono-bold'>Description :</Text>
                    <ScrollView
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={true}
                        indicatorStyle="black"
                    >
                        <Text className='font-spacemono text-sm'>
                            {currentSneaker.description || 'No description available'}
                        </Text>
                    </ScrollView>
                </View>
            </View>

        </View>
    );
};
