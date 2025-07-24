import { useState, useMemo, useEffect } from 'react';
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
import BackButton from '@/components/ui/buttons/BackButton';

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
        router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/search');
    };

    const swipeGesture = Gesture.Pan()
        .onEnd((event) => {
            if (event.velocityX > 500 && Math.abs(event.velocityY) < Math.abs(event.velocityX)) {
                runOnJS(handleSwipeBack)();
            }
        });

    const backButtonSection = (
        <View className="flex-row items-center">
            <BackButton onPressAction={handleSwipeBack} backgroundColor='transparent' />
        </View>
    );

    if (!sneakers || sneakers.length === 0) {
        return (
            <GestureDetector gesture={swipeGesture}>
                <ScrollView
                    className="flex-1 mt-12"
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
                    {backButtonSection}
                    <ProfileHeader user={userSearch} userSneakers={[]} viewMode={viewMode} setViewMode={setViewMode} />
                    <EmptySneakersState onAddPress={() => {}} />
                </ScrollView>
            </GestureDetector>
        );
    }

    if (viewMode === 'card') {
        return (
            <GestureDetector gesture={swipeGesture}>
                <ScrollView
                    className="flex-1 mt-12"
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
                    {backButtonSection}
                    <ProfileHeader user={userSearch} userSneakers={sneakers} viewMode={viewMode} setViewMode={setViewMode} />
                    <View className="flex-1 gap-8">
                        <SneakersCardByBrand
                            sneakersByBrand={sneakersByBrand}
                            onSneakerPress={handleSneakerPress}
                        />
                    </View>
                </ScrollView>
            </GestureDetector>
        );
    }

    return (
        <GestureDetector gesture={swipeGesture}>
            <View className="flex-1 mt-12">
                <SneakersListView 
                    sneakers={sneakers}
                    onSneakerPress={handleSneakerPress}
                    header={
                        <View>
                            {backButtonSection}
                            <ProfileHeader user={userSearch} userSneakers={sneakers} viewMode={viewMode} setViewMode={setViewMode} />
                        </View>
                    }
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    scrollEnabled={true}
                />
            </View>
        </GestureDetector>
    );
} 