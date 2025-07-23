import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Feather } from '@expo/vector-icons';
import { Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FollowingUser } from '@/services/FollowerService';

interface FollowingCollectionCardProps {
    followingUser: FollowingUser;
    userSneakers: any[];
}

export default function FollowingCollectionCard({ 
    followingUser, 
    userSneakers 
}: FollowingCollectionCardProps) {

    const navigateToUserProfile = () => {
        router.push(`/(app)/user-profile/${followingUser.id}`);
    };

    return (
        <Pressable 
            className="bg-white rounded-md gap-2 p-4 shadow-card mb-4"
            onPress={navigateToUserProfile}
            testID={`following-collection-card-${followingUser.id}`}
        >
            {/* Header with user info */}
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                    {followingUser.profile_picture ? (
                        <Image
                            source={{ uri: followingUser.profile_picture }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                        />
                    ) : (
                        <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
                            <Feather name="user" size={16} color="#666" />
                        </View>
                    )}
                    <View className="ml-2">
                        <Text className="font-open-sans-bold text-sm text-gray-900">
                            @{followingUser.username}
                        </Text>
                        <Text className="font-open-sans text-xs text-gray-500">
                            {followingUser.first_name} {followingUser.last_name}
                        </Text>
                    </View>
                </View>
                <Feather name="chevron-right" size={16} color="#666" />
            </View>

            {/* Sneakers preview */}
            <View className="flex flex-row items-center gap-1 w-full h-fit">
                {userSneakers?.slice(0, 2).map((sneaker, index) => (
                    sneaker ? (
                        <Image 
                            key={index} 
                            source={{ uri: sneaker.images?.[0]?.uri }} 
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
                        <View key={index} className="w-1/2 h-24 bg-slate-200 rounded-md flex flex-row items-center justify-center" testID="empty-slot">
                            <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                        </View>
                    )
                ))}
                {Array.from({ length: Math.max(0, 2 - (userSneakers?.length || 0)) }).map((_, index) => (
                    <View key={`empty-top-${index}`} className="w-1/2 h-24 bg-slate-200 rounded-md flex flex-row items-center justify-center" testID="empty-slot">
                        <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                    </View>
                ))}
            </View>

            <View className="flex flex-row items-center gap-1 w-full h-24">
                {userSneakers?.slice(2, 4).map((sneaker, index) => (
                    sneaker ? (
                        <Image 
                            key={index}
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
                        <View key={index} className="w-1/2 h-24 bg-slate-200 rounded-md flex flex-row items-center justify-center" testID="empty-slot">
                            <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                        </View>
                    )
                ))}
                {Array.from({ length: Math.max(0, 2 - (userSneakers?.slice(2, 4).length || 0)) }).map((_, index) => (
                    <View key={`empty-bottom-${index}`} className="w-1/2 h-24 bg-slate-200 rounded-md flex flex-row items-center justify-center" testID="empty-slot">
                        <MaterialCommunityIcons name="shoe-sneaker" size={24} color="white" />
                    </View>
                ))}
            </View>

            {/* Footer with stats */}
            <View className="flex flex-row justify-between items-center">
                <Text className="font-open-sans text-xs text-gray-500">
                    {followingUser.followers_count} followers
                </Text>
                <Text className="text-primary font-open-sans-bold text-lg">
                    {userSneakers?.length || 0} shoes
                </Text>
            </View>
        </Pressable>
    );
} 