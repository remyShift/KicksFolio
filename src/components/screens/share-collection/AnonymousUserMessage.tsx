import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

export function AnonymousUserMessage() {
	const { t } = useTranslation();

	const handleLoginPress = () => {
		router.push('/(auth)/login');
	};

	return (
		<View className="bg-primary/10 p-4 mx-4 mb-4 rounded-lg">
			<Text className="font-open-sans text-sm text-primary text-center mb-2">
				{t('share.connectToAccess')}
			</Text>
			<Text
				className="font-open-sans-bold text-sm text-primary text-center underline"
				onPress={handleLoginPress}
			>
				{t('share.connectNow')}
			</Text>
		</View>
	);
}
