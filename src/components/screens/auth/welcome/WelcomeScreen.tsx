import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { AnimatedEntry } from '@/components/ui/animations/AnimatedEntry';
import MainButton from '@/components/ui/buttons/MainButton';
import WelcomeImageCarousel from '@/components/ui/images/welcomeImageCaroussel/WelcomeImageCarousel';
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
		<View className="flex-1 bg-background gap-12">
			<AnimatedEntry delay={0}>
				<View className="items-center gap-8 mt-20">
					<PageTitle content={t('auth.titles.welcome')} />
					<Text className="text-gray-900 font-open-sans-bold text-lg text-center px-12">
						{t('auth.welcome.subtitle')}
					</Text>
				</View>
			</AnimatedEntry>

			<AnimatedEntry delay={300}>
				<WelcomeImageCarousel />
			</AnimatedEntry>

			<View className="flex-1 justify-end items-center pb-10 w-full px-8">
				<AnimatedEntry delay={600}>
					<View className="gap-4 w-full">
						<MainButton
							content={t('auth.buttons.signUp')}
							backgroundColor="bg-primary"
							onPressAction={handleSignUp}
							width="full"
						/>

						<MainButton
							content={t('auth.buttons.login')}
							backgroundColor="bg-transparent"
							borderColor="primary"
							textColor="primary"
							onPressAction={handleLogin}
							width="full"
						/>
					</View>
				</AnimatedEntry>
			</View>

			<AuthMethodModalWrapper
				visible={isModalVisible}
				onClose={closeModal}
				mode={authMode}
			/>
		</View>
	);
}
