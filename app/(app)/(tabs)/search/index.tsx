import { View } from 'react-native';
import SearchHeader from '@/components/screens/app/search/SearchHeader';
import SearchResultsList from '@/components/screens/app/search/SearchResultList';

export default function SearchScreen() {
    return (
        <View className="flex-1 bg-background pt-32 gap-10">
            <SearchHeader />

            <SearchResultsList />
        </View>
    );
} 