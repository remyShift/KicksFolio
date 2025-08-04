import { Text, View, Pressable } from 'react-native';
import { Sneaker } from '@/types/sneaker';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import EmptySneakerImage from '../placeholders/EmptySneakerImage';

interface CollectionCardProps {
    userSneakers: Sneaker[] | null | undefined;
    isOwnCollection: boolean;
    userId?: string;
}

export default function CollectionCard({ userSneakers, isOwnCollection = true, userId }: CollectionCardProps) {
    return (
        <Pressable className="flex-1 bg-white rounded-md gap-2 p-4 h-fit shadow-card"
            onPress={() => {
                if (isOwnCollection) {
                    router.push(`/(app)/(tabs)/profile`);
                } else {
                    router.push(`/(app)/(tabs)/search/${userId}`);
                }
            }}
            testID="collection-card"
        >
            <View className="flex flex-row items-center gap-1 w-full h-fit">
                {userSneakers?.slice(0, 2).map((sneaker, index) => (
                    sneaker ? (
                        <Image key={index} source={{ uri: sneaker.images?.[0]?.uri }} 
                            style={{
                                width: '50%',
                                height: 'auto',
                                aspectRatio: 1.5,
                                borderRadius: 3
                            }}
                            contentFit="cover"
                            contentPosition="center"
                            cachePolicy="memory-disk"
                            testID="sneaker-image"
                        />
                    ) : (
                        <EmptySneakerImage />
                    )
                ))}
                {Array.from({ length: Math.max(0, 2 - (userSneakers?.length || 0)) }).map((_, index) => (
                    <EmptySneakerImage key={`empty-top-${index}`} />
                ))}
            </View>

            <View className="flex flex-row items-center gap-1 w-full h-24">
                {userSneakers?.slice(2, 4).map((sneaker, index) => (
                    sneaker ? (
                        <Image key={index}
                            source={{ uri: sneaker.images?.[0]?.uri }} 
                            style={{
                                width: '50%',
                                height: 120,
                                borderRadius: 3
                            }}
                            contentFit="cover"
                            contentPosition="center"
                            cachePolicy="memory-disk"
                            testID="sneaker-image"
                        />
                    ) : (
                        <EmptySneakerImage key={index} />
                    )
                ))}
                {Array.from({ length: Math.max(0, 2 - (userSneakers?.slice(2, 4).length || 0)) }).map((_, index) => (
                    <EmptySneakerImage key={`empty-bottom-${index}`} />
                ))}
            </View>

            <Text className="text-primary font-open-sans-bold text-lg">{userSneakers?.length || 0} shoes</Text>
        </Pressable>
    );
}