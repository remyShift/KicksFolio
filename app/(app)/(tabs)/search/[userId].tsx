import { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Sneaker } from '@/types/Sneaker';
import EmptySneakersState from '@/components/screens/app/profile/displayState/EmptySneakersState';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';
import { useModalStore } from '@/store/useModalStore';
import CardDisplay from '@/components/screens/app/profile/displayState/card/CardDisplay';
import ListDisplay from '@/components/screens/app/profile/displayState/list/ListDisplay';
import { useViewDisplayStateStore, ViewDisplayState } from '@/store/useViewDisplayStateStore';

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { t } = useTranslation();
    const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
    const [refreshing, setRefreshing] = useState(false);
    const { viewDisplayState } = useViewDisplayStateStore();

    const {
        userProfile,
        isLoading,
        refreshUserProfile,
    } = useUserProfile(userId);

    const sneakersByBrand = useMemo(() => {
        if (!userProfile?.sneakers || userProfile.sneakers.length === 0) return {};
        
        return userProfile.sneakers.reduce((acc, sneaker) => {
            const normalizedBrand = sneaker.brand.toLowerCase().trim();
            
            if (!acc[normalizedBrand]) {
                acc[normalizedBrand] = [];
            }
            acc[normalizedBrand].push(sneaker);
            return acc;
        }, {} as Record<string, any[]>);
    }, [userProfile?.sneakers]);

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

    const handleBackSwipe = () => {
        router.dismissTo('/(app)/(tabs)/search');
    };

    const { userSearch, sneakers } = userProfile;

    if (!sneakers || sneakers.length === 0) {
        return (
            <ScrollView
                className="flex-1 mt-16"
                testID="scroll-view"
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        tintColor="#FF6B6B"
                        progressViewOffset={60}
                        testID="refresh-control"
                    />
                }
            >
                <ProfileHeader 
                    user={userSearch} 
                    userSneakers={[]} 
                    showBackButton={true}
                />
                <EmptySneakersState onAddPress={() => {}} showAddButton={false} />
            </ScrollView>
        );
    }

    if (viewDisplayState === ViewDisplayState.Card) {
        return (
            <CardDisplay
                sneakersByBrand={sneakersByBrand}
                handleSneakerPress={handleSneakerPress}
                refreshing={refreshing}
                onRefresh={onRefresh}
                user={userSearch}
                userSneakers={sneakers}
                showBackButton={true}
            />
        );
    }

    return (
        <ListDisplay
            userSneakers={sneakers}
            handleSneakerPress={handleSneakerPress}
            refreshing={refreshing}
            onRefresh={onRefresh}
            user={userSearch}
            showBackButton={true}
        />
    );
} 