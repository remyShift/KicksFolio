import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface SearchLoadingFooterProps {
	isLoading: boolean;
	hasResults: boolean;
}

export default function SearchLoadingFooter({
	isLoading,
	hasResults,
}: SearchLoadingFooterProps) {
	const { t } = useTranslation();

	if (!isLoading || !hasResults) {
		return null;
	}

	return (
		<View className="py-4 items-center">
			<Text className="font-open-sans text-gray-700">
				{t('ui.loading')}
			</Text>
		</View>
	);
}
