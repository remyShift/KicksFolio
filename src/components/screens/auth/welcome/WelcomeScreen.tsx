import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import MainButton from '@/components/ui/buttons/MainButton';
import PageTitle from '@/components/ui/text/PageTitle';

import AuthMethodModal from './AuthMethodModal';

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
		<>
			<KeyboardAwareScrollView
				className="flex-1 bg-background"
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					flexGrow: 1,
					padding: 8,
				}}
				bottomOffset={15}
			>
				<View className="flex-1 justify-center items-center gap-12 mt-20">
					<View className="items-center gap-4">
						<PageTitle content={t('auth.titles.welcome')} />
						<Text className="text-gray-600 text-center text-base px-8">
							{t('auth.welcome.subtitle')}
						</Text>
					</View>

					<View className="flex gap-4 w-full justify-center items-center px-12">
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
				</View>
			</KeyboardAwareScrollView>

			<AuthMethodModal
				visible={isModalVisible}
				onClose={closeModal}
				mode={authMode}
			/>
		</>
	);
}
