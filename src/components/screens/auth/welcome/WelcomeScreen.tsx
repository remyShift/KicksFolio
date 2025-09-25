import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import MainButton from '@/components/ui/buttons/MainButton';
import PageTitle from '@/components/ui/text/PageTitle';

import AuthMethodModalWrapper from './AuthMethodModalWrapper';

export default function WelcomeScreen() {
	const { t } = useTranslation();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

	const handleLogin = () => {
		setAuthMode('login');
		setIsModalVisible(true);
	};

	const handleSignUp = () => {
		setAuthMode('signup');
		setIsModalVisible(true);
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setAuthMode(null);
	};

	return (
		<View className="flex-1 bg-background">
			<View className="items-center gap-4 mt-20">
				<PageTitle content={t('auth.titles.welcome')} />
				<Text className="text-gray-900 font-open-sans-bold text-lg text-center">
					{t('auth.welcome.subtitle')}
				</Text>
			</View>

			<View className="flex-1 justify-end items-center gap-4 pb-10">
				<MainButton
					content={t('auth.buttons.signUp')}
					backgroundColor="bg-primary"
					onPressAction={handleSignUp}
				/>

				<MainButton
					content={t('auth.buttons.login')}
					backgroundColor="bg-transparent"
					borderColor="primary"
					textColor="primary"
					onPressAction={handleLogin}
				/>
			</View>

			<AuthMethodModalWrapper
				visible={isModalVisible}
				onClose={closeModal}
				mode={authMode}
			/>
		</View>
	);
}
