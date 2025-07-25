import { useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Sneaker } from '@/types/Sneaker';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useModalStore } from '@/store/useModalStore';
import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { t } = useTranslation();
    const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
    const [refreshing, setRefreshing] = useState(false);

    const {
        userProfile,
        isLoading,
        refreshUserProfile,
    } = useUserProfile(userId);

    if (isLoading) {
        return (
            <View className="flex-1 bg-background pt-32 items-center justify-center">
                <Text className="font-open-sans text-gray-500">
                    {t('ui.loading')}
                </Text>
            </View>
        );
    }

    if (!userProfile) {
        return (
            <View className="flex-1 bg-background pt-32 items-center justify-center">
                <Text className="font-open-sans text-gray-500">
                    {t('userProfile.error.notFound')}
                </Text>
            </View>
        );
    }

    const handleSneakerPress = (sneaker: Sneaker) => {
        setCurrentSneaker(sneaker);
        setModalStep('view');
        setIsVisible(true);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (userProfile) {
            await refreshUserProfile();
        }
        setRefreshing(false);
    };

    const { userSearch, sneakers } = userProfile;

    return (
        <ProfileDisplayContainer
            user={userSearch}
            userSneakers={sneakers || []}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onSneakerPress={handleSneakerPress}
            showBackButton={true}
        />
    );
} 