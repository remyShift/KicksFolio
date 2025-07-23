import { useUserSearch } from "@/hooks/useUserSearch";
import { SearchUser } from "@/services/UserSearchService";
import { FlatList, RefreshControl } from "react-native";
import UserListItem from "./listItem/UserListItem";
import SearchEmptyState from "./SearchEmptyState";
import SearchLoadingFooter from "./SearchLoadingFooter";
import { useCallback } from "react";
import { router } from "expo-router";

export default function SearchResultsList() {
    const { searchResults, isLoading, refreshing, onRefresh, loadMore } = useUserSearch();

    const renderUserItem = useCallback(({ item }: { item: SearchUser }) => (
        <UserListItem 
            searchUser={item}
        />
    ), []);

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
        <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyComponent}
            ListFooterComponent={renderFooterComponent}
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
    );
} 