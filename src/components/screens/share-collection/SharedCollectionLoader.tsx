import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

export default function SharedCollectionLoader() {
	const { t } = useTranslation();

	return (
		<View className="flex-1 bg-background pt-32 items-center justify-center">
			<ActivityIndicator size="large" color="black" />
			<Text className="font-open-sans text-gray-500 mt-4">
				{t('share.shared.loading')}
			</Text>
		</View>
	);
}
