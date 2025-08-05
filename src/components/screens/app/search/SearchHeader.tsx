import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Title from '@/components/ui/text/Title';

import SearchInput from './SearchInput';

export default function SearchHeader() {
	const { t } = useTranslation();

	return (
		<View className="flex gap-4">
			<Title content={t('navigation.navbar.search')} />
			<SearchInput />
		</View>
	);
}
