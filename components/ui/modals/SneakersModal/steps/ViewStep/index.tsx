import { View, Text, ScrollView } from 'react-native';
import { ConditionBar } from '@/components/ui/indicators/ConditionBar';
import { useState } from 'react';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useModalStore } from '@/store/useModalStore';
import { PhotoCarousel } from '@/components/ui/images/photoCaroussel/PhotoCarousel';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LoveButton from '@/components/ui/modals/SneakersModal/steps/ViewStep/LoveButton';
import SizeDisplay from '@/components/ui/text/SizeDisplay';
import { useCurrencyStore } from '@/store/useCurrencyStore';

export const ViewStep = () => {
    const { currentSneaker } = useModalStore();
    const [errorMsg, setErrorMsg] = useState('');
    const { formattedPrice } = useCurrencyStore();

    if (!currentSneaker) {
        return null;
    }

    const photos = currentSneaker.images?.map((image, index) => ({
        id: `${currentSneaker.id || 'temp'}-${index}`,
        uri: image.uri,
        alt: `${currentSneaker.model} image ${index + 1}`
    })) || [];

    return (
        <View className="flex-1 gap-4">
            <ErrorMsg content={errorMsg} display={errorMsg !== ''}/>
            
            {photos.length > 0 ? (
                <PhotoCarousel photos={photos} height={200} />
            ) : (
                <View className="h-50 bg-gray-200 rounded-md flex items-center justify-center">
                    <MaterialIcons name="image" size={48} color="gray" />
                    <Text className="text-gray-500 mt-2">No images available</Text>
                </View>
            )}

            <View className="flex-row justify-between items-center px-2">
                <View className="flex gap-0">
                    <Text testID="sneaker-display-name" className="font-spacemono-bold text-lg">{currentSneaker.model}</Text>
                    <View className="flex-row items-center gap-1">
                        <Text className="font-spacemono-bold-italic text-base">{currentSneaker.brand.toUpperCase()}</Text>
                        {currentSneaker.sku && (
                            <View className="flex-row items-center gap-1">
                                <Text className="font-spacemono-bold text-sm">|</Text>
                                <Text className="font-spacemono-bold text-sm">
                                    {currentSneaker.sku.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                    <LoveButton sneaker={currentSneaker} />
            </View>

            <View className='flex gap-4'>
                <View className="flex-row items-center w-full border-t-2 border-gray-300">
                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Size</Text>
                        <View className="w-4/5">
                            <SizeDisplay 
                                sneaker={currentSneaker}
                                className='font-spacemono-bold text-lg text-center' 
                            />
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
                        <Text className='font-spacemono text-center text-sm'>Status</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-lg text-center">{currentSneaker.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View className='flex-col items-center p-2 gap-1 w-1/3'>
                        <Text className='font-spacemono text-center text-sm'>Value</Text>
                        <View className="w-4/5">
                            <Text className="font-spacemono-bold text-lg text-center">
                                {currentSneaker.estimated_value ? formattedPrice(currentSneaker.estimated_value) : 'N/A'}
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
