import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Link } from 'expo-router';

export default function PrivacyPolicy() {
	const { t } = useTranslation();

	return (
		<View className="flex-row gap-1 justify-center items-center bg-background pb-10 flex-wrap">
			<Text className="font-open-sans-bold text-xs text-gray-900">
				{t('auth.data-privacy.title')}
			</Text>
			<Link href="https://remyshift.github.io/KicksFolio/terms-of-use">
				<Text className="text-primary font-open-sans-bold text-xs">
					{t('auth.data-privacy.termsOfUse')}
				</Text>
			</Link>
			<Link href="https://remyshift.github.io/KicksFolio/privacy-policy">
				<Text className="text-primary font-open-sans-bold text-xs">
					{t('auth.data-privacy.privacyPolicy')}
				</Text>
			</Link>
		</View>
	);
}
