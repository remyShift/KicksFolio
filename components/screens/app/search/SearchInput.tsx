import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useUserSearch } from '@/hooks/useUserSearch';

export default function SearchInput() {
	const { t } = useTranslation();
	const { searchTerm, handleSearchChange } = useUserSearch();

	return (
		<View className="px-4">
			<TextInput
				className="bg-white border border-gray-200 rounded-lg p-3 font-open-sans text-base placeholder:text-gray-300"
				placeholder={t('search.inputPlaceholder')}
				value={searchTerm}
				returnKeyType="search"
				onSubmitEditing={() => handleSearchChange(searchTerm)}
				onChangeText={handleSearchChange}
				autoCapitalize="none"
				autoCorrect={false}
				testID="search-input"
			/>
			<View className="absolute right-7 top-3">
				<Feather name="search" size={20} color="#666" />
			</View>
		</View>
	);
}
