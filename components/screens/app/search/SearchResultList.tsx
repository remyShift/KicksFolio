import { useUserSearch } from "@/hooks/useUserSearch";
import { SearchUser } from "@/services/UserSearchService";
import { FlatList, RefreshControl } from "react-native";

interface SearchResultsListProps {
    renderItem: ({ item }: { item: SearchUser }) => React.JSX.Element;
    ListEmptyComponent: () => React.JSX.Element;
    ListFooterComponent: () => React.JSX.Element | null;
}

export default function SearchResultsList({
    renderItem,
    ListEmptyComponent,
    ListFooterComponent,
}: SearchResultsListProps) {
    const { searchResults, refreshing, onRefresh, loadMore } = useUserSearch();

    return (
        <FlatList
            data={searchResults}
            renderItem={renderItem}
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
    );
} 