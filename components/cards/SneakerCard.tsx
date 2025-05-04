import { View, Text, Pressable } from 'react-native';
import { Sneaker } from '@/types/ProfileData';
import { Image } from 'expo-image';

export default function SneakerCard({ sneaker, setModalStep, setModalVisible, setSneaker }: { 
    sneaker: Sneaker, 
    setModalStep: (step: 'index' | 'box' | 'noBox' | 'sneakerInfo') => void, 
    setModalVisible: (visible: boolean) => void,
    setSneaker: (sneaker: Sneaker) => void 
}) {

    return (
        <Pressable className="flex-1 bg-white rounded-md p-3 w-full gap-2 shadow-card"
            onPress={() => {
                setSneaker(sneaker);
                setModalStep('sneakerInfo');
                setModalVisible(true);
            }}
        >
            <Image source={{ uri: sneaker.images?.[0]?.url }}
                style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 3
                }}
                contentFit="cover"
                contentPosition="center"
                cachePolicy="memory-disk"
                transition={200}
            />
            <View className="flex flex-row justify-between items-center px-1">
                <Text className="font-spacemono-bold text-lg flex-1 mr-2 flex-shrink" numberOfLines={1} ellipsizeMode="tail">
                    {sneaker.model}
                </Text>
                <Text className="text-primary font-spacemono-bold text-lg flex-shrink-0">
                    {sneaker.size}US
                </Text>
            </View>
        </Pressable>
    );
}