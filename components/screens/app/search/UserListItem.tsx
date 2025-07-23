import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { SearchUser } from '@/services/UserSearchService';

interface UserListItemProps {
    user: SearchUser;
    onPress: (userId: string) => void;
    testID?: string;
}

export default function UserListItem({ user, onPress, testID }: UserListItemProps) {
    const { t } = useTranslation();

    const handlePress = () => {
        onPress(user.id);
    };

    return (
        <Pressable
            className="flex-row items-center p-4 bg-white mx-4 mb-3 rounded-lg shadow-sm"
            onPress={handlePress}
            testID={testID || `user-item-${user.id}`}
        >
            <UserAvatar user={user} />
            <UserInfo user={user} />
            <UserActions user={user} />
        </Pressable>
    );
}

interface UserAvatarProps {
    user: SearchUser;
}

function UserAvatar({ user }: UserAvatarProps) {
    return (
        <View className="mr-4">
            {user.profile_picture ? (
                <Image
                    source={{ uri: user.profile_picture }}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
            ) : (
                <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center">
                    <Feather name="user" size={24} color="#666" />
                </View>
            )}
        </View>
    );
}

interface UserInfoProps {
    user: SearchUser;
}

function UserInfo({ user }: UserInfoProps) {
    const { t } = useTranslation();

    return (
        <View className="flex-1">
            <Text className="font-open-sans-bold text-lg text-gray-900">
                {user.username}
            </Text>
            <Text className="font-open-sans text-sm text-gray-600">
                {user.first_name} {user.last_name}
            </Text>
            <View className="flex-row mt-1 space-x-4">
                <Text className="font-open-sans text-xs text-gray-500">
                    {user.followers_count} {t('social.followers')}
                </Text>
                <Text className="font-open-sans text-xs text-gray-500">
                    {user.following_count} {t('social.following')}
                </Text>
            </View>
        </View>
    );
}

interface UserActionsProps {
    user: SearchUser;
}

function UserActions({ user }: UserActionsProps) {
    const { t } = useTranslation();

    return (
        <View className="items-center">
            {user.is_following && (
                <View className="bg-primary/10 px-2 py-1 rounded-full mb-1">
                    <Text className="font-open-sans-bold text-xs text-primary">
                        {t('social.following')}
                    </Text>
                </View>
            )}
            <Feather name="chevron-right" size={20} color="#666" />
        </View>
    );
} 