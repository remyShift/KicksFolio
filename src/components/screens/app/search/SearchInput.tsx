import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { useUserSearch } from '@/hooks/useUserSearch';

export default function SearchInput() {
	const { t } = useTranslation();
	const { searchTerm, handleSearchChange } = useUserSearch();
	const [isFocused, setIsFocused] = useState(false);

	return (
		<View className="px-4">
			<TextInput
				className={`bg-white border border-gray-200 rounded-lg p-3 font-open-sans text-base placeholder:text-gray-300 ${
					isFocused ? 'border-primary' : ''
				}`}
				placeholder={t('search.inputPlaceholder')}
				onFocus={() => {
					setIsFocused(true);
				}}
				onBlur={() => {
					setIsFocused(false);
				}}
				value={searchTerm}
				returnKeyType="search"
				onSubmitEditing={() => handleSearchChange(searchTerm)}
				onChangeText={handleSearchChange}
				autoCapitalize="none"
				autoCorrect={false}
				testID="search-input"
			/>
		</View>
	);
}
