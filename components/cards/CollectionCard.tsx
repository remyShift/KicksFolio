import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View, Pressable } from 'react-native';
import { Collection } from '@/types/Models';
import { Sneaker } from '@/types/Models';
import { router } from 'expo-router';
import { Image } from 'expo-image';

export default function CollectionCard({ userCollection, userSneakers }: { userCollection: Collection | null | undefined, userSneakers: Sneaker[] | null | undefined }) {

    return (
        <Pressable className="flex-1 bg-white rounded-md gap-2 p-4 h-fit shadow-card"
            onPress={() => {
                router.push(`/(app)/(tabs)/user`);
            }}
        >
            <View className="flex flex-row items-center gap-1 w-full h-24">
                {userSneakers?.slice(0, 2).map((sneaker, index) => (
                    sneaker ? (
                        <Image key={index} source={{ uri: sneaker.images?.[0]?.url }} 
                            style={{
                                width: '50%',
                                height: '100%',
                                borderRadius: 3
                            }}
                            contentFit="cover"
                            contentPosition="center"
                            cachePolicy="memory-disk"
                        />
                    ) : (
                        <View key={index} className="w-1/2 h-full bg-slate-200 rounded-md flex flex-row items-center justify-center">
                            <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                        </View>
                    )
                ))}
                {Array.from({ length: Math.max(0, 2 - (userSneakers?.length || 0)) }).map((_, index) => (
                    <View key={`empty-top-${index}`} className="w-1/2 h-full bg-slate-200 rounded-md flex flex-row items-center justify-center">
                        <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                    </View>
                ))}
            </View>

            <View className="flex flex-row items-center gap-1 w-full h-24">
                {userSneakers?.slice(2, 4).map((sneaker, index) => (
                    sneaker ? (
                        <Image key={index}
                            source={{ uri: sneaker.images?.[0]?.url }} 
                            style={{
                                width: '50%',
                                height: '100%',
                                borderRadius: 3
                            }}
                            contentFit="cover"
                            contentPosition="center"
                            cachePolicy="memory-disk"
                        />
                    ) : (
                        <View key={index} className="w-1/2 h-full bg-slate-200 rounded-md flex flex-row items-center justify-center">
                            <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                        </View>
                    )
                ))}
                {Array.from({ length: Math.max(0, 2 - (userSneakers?.slice(2, 4).length || 0)) }).map((_, index) => (
                    <View key={`empty-bottom-${index}`} className="w-1/2 h-full bg-slate-200 rounded-md flex flex-row items-center justify-center">
                        <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                    </View>
                ))}
            </View>

            <View className="flex flex-row justify-between items-center">
                <Text className="font-spacemono-bold text-lg">{userCollection?.name}</Text>
                <Text className="text-primary font-spacemono-bold text-lg">{userSneakers?.length || 0} shoes</Text>
            </View>
        </Pressable>
    );
}