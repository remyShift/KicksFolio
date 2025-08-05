import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Link } from 'expo-router';

export default function PrivacyPolicy() {
	const { t } = useTranslation();

	return (
		<View className="flex justify-center items-center bg-background pb-10">
			<Text className="font-open-sans-bold text-xs">
				{t('auth.data-privacy.title')}
			</Text>
			<Link href="https://remyshift.github.io/KicksFolio">
				<Text className="text-primary font-open-sans-bold text-xs">
					{t('auth.data-privacy.privacyPolicy')}
				</Text>
			</Link>
		</View>
	);
}
