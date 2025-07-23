import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSession } from '@/context/authContext';
import { UserSearchService, SearchUser } from '@/services/UserSearchService';
import { FollowerService } from '@/services/FollowerService';
import BackButton from '@/components/ui/buttons/BackButton';
import MainButton from '@/components/ui/buttons/MainButton';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { ViewMode } from '@/types/Sneaker';
import SneakersListView from '@/components/screens/app/profile/displayState/SneakersListView';
import SneakersCardByBrand from '@/components/screens/app/profile/displayState/SneakersCardByBrand';
import EmptySneakersState from '@/components/screens/app/profile/displayState/EmptySneakersState';
import ViewToggleButton from '@/components/ui/buttons/ViewToggleButton';

interface UserProfileData {
    profile: SearchUser;
    sneakers: any[];
}

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { user: currentUser } = useSession();
    const { showSuccessToast, showErrorToast } = useToast();
    const { t } = useTranslation();

    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('card');

    const loadUserProfile = useCallback(async (showRefresh: boolean = false) => {
        if (!userId || !currentUser?.id) return;

        if (showRefresh) setRefreshing(true);
        else setIsLoading(true);

        try {
            const [profile, sneakers] = await Promise.all([
                UserSearchService.getUserProfile(userId, currentUser.id),
                UserSearchService.getUserSneakers(userId)
            ]);

            if (profile) {
                setUserProfile({
                    profile,
                    sneakers: sneakers || []
                });
            } else {
                showErrorToast(
                    t('userProfile.error.notFound'),
                    t('userProfile.error.notFoundDesc')
                );
                router.back();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            showErrorToast(
                t('userProfile.error.loadFailed'),
                t('userProfile.error.loadFailedDesc')
            );
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [userId, currentUser?.id, showErrorToast, t]);

    const handleFollowToggle = useCallback(async () => {
        if (!userProfile?.profile || !currentUser?.id || isFollowLoading) return;

        setIsFollowLoading(true);

        try {
            if (userProfile.profile.is_following) {
                await FollowerService.unfollowUser(userProfile.profile.id);
                showSuccessToast(
                    t('social.unfollowed'),
                    t('social.unfollowedDesc', { username: userProfile.profile.username })
                );
            } else {
                await FollowerService.followUser(userProfile.profile.id);
                showSuccessToast(
                    t('social.followed'),
                    t('social.followedDesc', { username: userProfile.profile.username })
                );
            }

            // Update local state
            setUserProfile(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        is_following: !prev.profile.is_following,
                        followers_count: prev.profile.is_following 
                            ? prev.profile.followers_count - 1 
                            : prev.profile.followers_count + 1
                    }
                };
            });
        } catch (error) {
            console.error('Error toggling follow:', error);
            showErrorToast(
                t('social.error.followFailed'),
                t('social.error.followFailedDesc')
            );
        } finally {
            setIsFollowLoading(false);
        }
    }, [userProfile?.profile, currentUser?.id, isFollowLoading, showSuccessToast, showErrorToast, t]);

    const onRefresh = useCallback(() => {
        loadUserProfile(true);
    }, [loadUserProfile]);

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

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    if (isLoading) {
        return (
            <View className="flex-1 bg-background pt-16 items-center justify-center">
                <Text className="font-open-sans text-gray-500">
                    {t('ui.loading')}
                </Text>
            </View>
        );
    }

    if (!userProfile) {
        return (
            <View className="flex-1 bg-background pt-16 items-center justify-center">
                <Text className="font-open-sans text-gray-500">
                    {t('userProfile.error.notFound')}
                </Text>
            </View>
        );
    }

    const { profile, sneakers } = userProfile;

    return (
        <View className="flex-1 bg-background">
            <View className="pt-16 pb-4 px-4 bg-white shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <BackButton onPressAction={() => router.back()} />
                    <Text className="font-open-sans-bold text-lg">
                        {profile.username}
                    </Text>
                    <View style={{ width: 32 }} />
                </View>

                <View className="flex-row items-center">
                    <View className="mr-4">
                        {profile.profile_picture ? (
                            <Image
                                source={{ uri: profile.profile_picture }}
                                style={{ width: 80, height: 80, borderRadius: 40 }}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <View className="w-20 h-20 bg-gray-300 rounded-full items-center justify-center">
                                <Feather name="user" size={32} color="#666" />
                            </View>
                        )}
                    </View>

                    <View className="flex-1">
                        <Text className="font-open-sans-bold text-xl text-gray-900">
                            {profile.first_name} {profile.last_name}
                        </Text>
                        <Text className="font-open-sans text-gray-600 mb-2">
                            @{profile.username}
                        </Text>
                        
                        <View className="flex-row space-x-6">
                            <View className="items-center">
                                <Text className="font-open-sans-bold text-lg">
                                    {sneakers.length}
                                </Text>
                                <Text className="font-open-sans text-xs text-gray-500">
                                    {t('collection.shoes')}
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="font-open-sans-bold text-lg">
                                    {profile.followers_count}
                                </Text>
                                <Text className="font-open-sans text-xs text-gray-500">
                                    {t('social.followers')}
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="font-open-sans-bold text-lg">
                                    {profile.following_count}
                                </Text>
                                <Text className="font-open-sans text-xs text-gray-500">
                                    {t('social.following')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mt-4">
                    <MainButton
                        content={profile.is_following ? t('social.unfollow') : t('social.follow')}
                        backgroundColor={profile.is_following ? "bg-gray-200" : "bg-primary"}
                        onPressAction={handleFollowToggle}
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#F27329"
                    />
                }
            >
                <View className="p-4">
                    {sneakers.length > 0 ? (
                        <>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="font-open-sans-bold text-lg">
                                    {t('collection.pages.titles.collection')}
                                </Text>
                                <ViewToggleButton 
                                    currentMode={viewMode}
                                    onToggle={setViewMode}
                                />
                            </View>

                            {viewMode === 'list' ? (
                                <SneakersListView 
                                    sneakers={sneakers}
                                    onSneakerPress={() => {}} // Read-only for other users
                                />
                            ) : (
                                <SneakersCardByBrand 
                                    sneakersByBrand={sneakersByBrand}
                                    onSneakerPress={() => {}} // Read-only for other users
                                />
                            )}
                        </>
                    ) : (
                        <EmptySneakersState 
                            username={profile.username}
                            isOwnProfile={false}
                            isReadOnly={true}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
} 