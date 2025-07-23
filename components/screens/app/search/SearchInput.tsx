import { View, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useUserSearch } from '@/hooks/useUserSearch';

export default function SearchInput() {
    const { t } = useTranslation();
    const { searchTerm, handleSearchChange } = useUserSearch();

    return (
        <View className="relative">
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
    );
} 