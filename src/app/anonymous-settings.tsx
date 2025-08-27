import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { router } from 'expo-router';

import AppSettings from '@/components/screens/app/settings/appSettings/AppSettings';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';
import SettingsMenuItem from '@/components/screens/app/settings/shared/SettingsMenuItem';

export default function AnonymousSettings() {
	const { t } = useTranslation();

	const handleLogin = () => {
		router.push({
			pathname: '/(auth)/login',
			params: { redirectSource: 'share-collection' },
		});
	};

	const handleSignUp = () => {
		router.push({
			pathname: '/(auth)/(signup)/sign-up',
			params: { redirectSource: 'share-collection' },
		});
	};

	return (
		<View
			className="flex-1 bg-white px-4"
			testID="anonymous-settings-container"
		>
			<SettingsHeader />

			<View className="flex-1 gap-6" testID="anonymous-settings-content">
				<View className="bg-primary/10 p-4 rounded-lg">
					<Text className="font-open-sans-bold text-primary text-center mb-2">
						{t('share.connectToAccess')}
					</Text>
					<Text className="font-open-sans text-primary text-center text-sm">
						{t('share.connectToAccessDescription')}
					</Text>
				</View>

				<AppSettings />

				<SettingsMenuItem
					icon="log-in-outline"
					label={t('auth.buttons.login')}
					onPress={handleLogin}
					color="#F27329"
					textColor="#F27329"
					testID="login-button"
				/>
				<SettingsMenuItem
					icon="log-in-outline"
					label={t('auth.buttons.signUp')}
					onPress={handleSignUp}
					color="#F27329"
					textColor="#F27329"
					testID="login-button"
				/>
			</View>
		</View>
	);
}
