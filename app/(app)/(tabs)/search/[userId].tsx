import { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Sneaker, ViewMode } from '@/types/Sneaker';
import SneakersListView from '@/components/screens/app/profile/displayState/SneakersListView';
import SneakersCardByBrand from '@/components/screens/app/profile/displayState/SneakersCardByBrand';
import EmptySneakersState from '@/components/screens/app/profile/displayState/EmptySneakersState';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';
import { useModalStore } from '@/store/useModalStore';

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { t } = useTranslation();
    const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('card');

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

    const { userSearch, sneakers } = userProfile;

    const handleSwipeBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/(app)/(tabs)/search');
        }
    };

    const swipeGesture = Gesture.Pan()
        .onEnd((event) => {
            if (event.velocityX > 500 && Math.abs(event.velocityY) < Math.abs(event.velocityX)) {
                runOnJS(handleSwipeBack)();
            }
        });

    return (
        <GestureDetector gesture={swipeGesture}>
            <ScrollView
                className="flex-1 pt-24"
                testID="scroll-view"
                scrollEnabled={true}
                refreshControl={
                    <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    tintColor="#FF6B6B"
                    progressViewOffset={60}
                    testID="refresh-control"
                    />
                }>
            <ProfileHeader user={userSearch} userSneakers={sneakers || []} viewMode={viewMode} setViewMode={setViewMode} />
        
            {!sneakers || sneakers.length === 0 ? (
                <EmptySneakersState onAddPress={() => {}} />
            ) : viewMode === 'card' ? (
                <View className="flex-1 gap-8">
                    <SneakersCardByBrand
                        sneakersByBrand={sneakersByBrand}
                        onSneakerPress={handleSneakerPress}
                    />
                </View>
            ) : (
                <View className="flex-1">
                    <SneakersListView 
                        sneakers={sneakers}
                        onSneakerPress={handleSneakerPress}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        scrollEnabled={false}
                    />
                </View>
            )}
            </ScrollView>
        </GestureDetector>
    );
} 