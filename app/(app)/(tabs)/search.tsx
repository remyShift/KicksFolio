import { useCallback } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserSearch } from '@/hooks/useUserSearch';
import { SearchUser } from '@/services/UserSearchService';
import UserListItem from '@/components/screens/app/search/listItem/UserListItem';
import SearchEmptyState from '@/components/screens/app/search/SearchEmptyState';
import SearchLoadingFooter from '@/components/screens/app/search/SearchLoadingFooter';
import SearchHeader from '@/components/screens/app/search/SearchHeader';
import SearchResultsList from '@/components/screens/app/search/SearchResultList';

export default function SearchScreen() {
    const { t } = useTranslation();
    
    const {
        searchTerm,
        searchResults,
        isLoading,
        loadMore,
        onRefresh
    } = useUserSearch();

    return (
        <View className="flex-1 bg-background pt-32">
            <SearchHeader />
            
            <SearchResultsList />
        </View>
    );
}
