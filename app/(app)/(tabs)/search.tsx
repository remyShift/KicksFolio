import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TextInput, Pressable, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSession } from '@/context/authContext';
import { UserSearchService, SearchUser } from '@/services/UserSearchService';
import { Image } from 'expo-image';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import Title from '@/components/ui/text/Title';

export default function SearchScreen() {
    const { t } = useTranslation();
    const { user } = useSession();
    const { showErrorToast } = useToast();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const performSearch = useCallback(async (term: string, pageNum: number = 0, isRefresh: boolean = false) => {
        if (!user?.id || term.trim().length < 2) {
            if (isRefresh) {
                setSearchResults([]);
                setHasMore(false);
                setPage(0);
            }
            return;
        }

        setIsLoading(true);
        
        UserSearchService.searchUsers(term.trim(), user.id, pageNum)
            .then((result) => {
                if (pageNum === 0 || isRefresh) {
                    setSearchResults(result.users);
                } else {
                    setSearchResults(prev => [...prev, ...result.users]);
                }
                setHasMore(result.hasMore);
                setPage(pageNum);
            })
            .catch((error) => {
                console.error('Search error:', error);
                showErrorToast(
                    t('search.error.title'),
                    t('search.error.message')
                );
            })
            .finally(() => {
                setIsLoading(false);
                setRefreshing(false);
            });
    }, [user?.id, showErrorToast, t]);

    const handleSearchChange = useCallback((text: string) => {
        setSearchTerm(text);
        if (text.trim().length >= 2) {
            const timeoutId = setTimeout(() => {
                performSearch(text, 0, true);
            }, 500); // Debounce search
            
            return () => clearTimeout(timeoutId);
        } else {
            setSearchResults([]);
            setHasMore(false);
            setPage(0);
        }
    }, [performSearch]);

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading && searchTerm.trim().length >= 2) {
            performSearch(searchTerm, page + 1);
        }
    }, [hasMore, isLoading, searchTerm, page, performSearch]);

    const onRefresh = useCallback(() => {
        if (searchTerm.trim().length >= 2) {
            setRefreshing(true);
            performSearch(searchTerm, 0, true);
        }
    }, [searchTerm, performSearch]);

    const navigateToUserProfile = useCallback((userId: string) => {
        router.push(`/(app)/user-profile/${userId}`);
    }, []);

    const renderUserItem = useCallback(({ item }: { item: SearchUser }) => (
        <Pressable
            className="flex-row items-center p-4 bg-white mx-4 mb-3 rounded-lg shadow-sm"
            onPress={() => navigateToUserProfile(item.id)}
            testID={`user-item-${item.id}`}
        >
            <View className="mr-4">
                {item.profile_picture ? (
                    <Image
                        source={{ uri: item.profile_picture }}
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
            
            <View className="flex-1">
                <Text className="font-open-sans-bold text-lg text-gray-900">
                    {item.username}
                </Text>
                <Text className="font-open-sans text-sm text-gray-600">
                    {item.first_name} {item.last_name}
                </Text>
                <View className="flex-row mt-1 space-x-4">
                    <Text className="font-open-sans text-xs text-gray-500">
                        {item.followers_count} {t('social.followers')}
                    </Text>
                    <Text className="font-open-sans text-xs text-gray-500">
                        {item.following_count} {t('social.following')}
                    </Text>
                </View>
            </View>

            <View className="items-center">
                {item.is_following && (
                    <View className="bg-primary/10 px-2 py-1 rounded-full">
                        <Text className="font-open-sans-bold text-xs text-primary">
                            {t('social.following')}
                        </Text>
                    </View>
                )}
                <Feather name="chevron-right" size={20} color="#666" />
            </View>
        </Pressable>
    ), [navigateToUserProfile, t]);

    const ListEmptyComponent = useMemo(() => (
        <View className="flex-1 items-center justify-center mt-20">
            <Feather name="search" size={64} color="#ccc" />
            <Text className="font-open-sans text-lg text-gray-500 mt-4 text-center">
                {searchTerm.length < 2 
                    ? t('search.placeholder')
                    : t('search.noResults')
                }
            </Text>
        </View>
    ), [searchTerm, t]);

    const ListFooterComponent = useMemo(() => {
        if (!isLoading || searchResults.length === 0) return null;
        
        return (
            <View className="py-4 items-center">
                <Text className="font-open-sans text-gray-500">
                    {t('ui.loading')}
                </Text>
            </View>
        );
    }, [isLoading, searchResults.length, t]);

    return (
        <View className="flex-1 bg-background pt-16">
            <View className="px-4 mb-4">
                <Title content={t('navigation.navbar.search')} />
                
                <View className="relative mt-4">
                    <TextInput
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3 pr-12 font-open-sans text-base"
                        placeholder={t('search.inputPlaceholder')}
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        testID="search-input"
                    />
                    <View className="absolute right-3 top-3">
                        <Feather name="search" size={20} color="#666" />
                    </View>
                </View>
            </View>

            <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={ListEmptyComponent}
                ListFooterComponent={ListFooterComponent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#F27329"
                    />
                }
                showsVerticalScrollIndicator={false}
                testID="search-results-list"
            />
        </View>
    );
} 