import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import AppleSignInButton from './AppleSignInButton';
import GoogleSignInButton from './GoogleSignInButton';

export default function OAuthSection() {
	const { t } = useTranslation();

	return (
		<View className="w-full gap-4">
			<View className="flex-row items-center gap-4">
				<View className="flex-1 h-px bg-gray-300" />
				<Text className="text-gray-500 text-sm">
					{t('auth.oauth.orContinueWith')}
				</Text>
				<View className="flex-1 h-px bg-gray-300" />
			</View>

			<View className="gap-3">
				<AppleSignInButton />
				<GoogleSignInButton />
			</View>
		</View>
	);
}
