import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Sneaker } from '@/types/Sneaker';
import { ModalStep } from '@/components/modals/SneakersModal/types';

export default function SneakerCard({ 
    sneaker, 
    setModalStep, 
    setModalVisible, 
    setSneaker,
    showOwnerInfo = false 
}: { 
    sneaker: Sneaker, 
    setModalStep: (step: ModalStep) => void, 
    setModalVisible: (visible: boolean) => void,
    setSneaker: (sneaker: Sneaker) => void,
    showOwnerInfo?: boolean
}) {

    return (
        <Pressable className="bg-white rounded-md p-3 gap-2 shadow-card w-96"
            onPress={() => {
                setSneaker(sneaker);
                setModalStep('view');
                setModalVisible(true);
            }}
            testID="sneaker-card"
        >
            {sneaker.images?.[0]?.uri ? (
                <Image source={{ uri: sneaker.images[0].uri }}
                    style={{
                        width: '100%',
                        minHeight: 180,
                        flex: 1,
                        borderRadius: 8
                    }}
                    contentFit="cover"
                    contentPosition="center"
                    cachePolicy="memory-disk"
                    transition={200}
                />
            ) : (
                <View className="w-full h-45 bg-gray-200 rounded-lg flex items-center justify-center" style={{ minHeight: 180 }}>
                    <MaterialCommunityIcons name="shoe-sneaker" size={48} color="#9CA3AF" />
                    <Text className="text-gray-500 mt-2 text-sm">No image</Text>
                </View>
            )}

            <View className="flex flex-row justify-between items-center px-1">
                <Text className="font-spacemono-bold text-lg flex-1 mr-2 flex-shrink" numberOfLines={1} ellipsizeMode="tail">
                    {sneaker.model}
                </Text>
                <Text className="text-primary font-spacemono-bold text-lg flex-shrink-0">
                    {sneaker.size}US
                </Text>
            </View>

            {/* Informations du propriétaire si applicable */}
            {showOwnerInfo && sneaker.owner && (
                <View className="bg-gray-50 p-2 rounded-lg mt-2">
                    <Text className="font-spacemono text-xs text-gray-600 uppercase">
                        Owned by
                    </Text>
                    <Text className="font-spacemono text-sm text-primary">
                        @{sneaker.owner.username}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}