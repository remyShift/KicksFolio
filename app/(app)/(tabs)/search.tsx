import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Title from '@/components/ui/text/Title';
import { useUserSearch } from '@/hooks/useUserSearch';
import { SearchUser } from '@/services/UserSearchService';
import SearchInput from '@/components/screens/app/search/SearchInput';
import UserListItem from '@/components/screens/app/search/UserListItem';
import SearchEmptyState from '@/components/screens/app/search/SearchEmptyState';
import SearchLoadingFooter from '@/components/screens/app/search/SearchLoadingFooter';

export default function SearchScreen() {
    const { t } = useTranslation();
    
    const {
        searchTerm,
        searchResults,
        isLoading,
        hasMore,
        refreshing,
        handleSearchChange,
        loadMore,
        onRefresh
    } = useUserSearch();

    const navigateToUserProfile = useCallback((userId: string) => {
        router.push(`/(app)/user-profile/${userId}`);
    }, []);

    const renderUserItem = useCallback(({ item }: { item: SearchUser }) => (
        <UserListItem 
            user={item}
            onPress={navigateToUserProfile}
        />
    ), [navigateToUserProfile]);

    const renderEmptyComponent = useCallback(() => (
        <SearchEmptyState 
            isInitialState={searchResults.length === 0 && !isLoading}
        />
    ), [searchResults.length, isLoading]);

    const renderFooterComponent = useCallback(() => (
        <SearchLoadingFooter 
            isLoading={isLoading}
            hasResults={searchResults.length > 0}
        />
    ), [isLoading, searchResults.length]);

    return (
        <View className="flex-1 bg-background pt-32">
            <SearchHeader 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
            />
            
            <SearchResultsList
                data={searchResults}
                renderItem={renderUserItem}
                ListEmptyComponent={renderEmptyComponent}
                ListFooterComponent={renderFooterComponent}
                onEndReached={loadMore}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </View>
    );
}

interface SearchHeaderProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

function SearchHeader({ searchTerm, onSearchChange }: SearchHeaderProps) {
    const { t } = useTranslation();

    return (
        <View className="px-4 mb-4">
            <Title content={t('navigation.navbar.search')} />
            <View className="mt-4">
                <SearchInput 
                    value={searchTerm}
                    onChangeText={onSearchChange}
                />
            </View>
        </View>
    );
}

interface SearchResultsListProps {
    data: SearchUser[];
    renderItem: ({ item }: { item: SearchUser }) => React.JSX.Element;
    ListEmptyComponent: () => React.JSX.Element;
    ListFooterComponent: () => React.JSX.Element | null;
    onEndReached: () => void;
    refreshing: boolean;
    onRefresh: () => void;
}

function SearchResultsList({
    data,
    renderItem,
    ListEmptyComponent,
    ListFooterComponent,
    onEndReached,
    refreshing,
    onRefresh
}: SearchResultsListProps) {
    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
            onEndReached={onEndReached}
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
    );
}
