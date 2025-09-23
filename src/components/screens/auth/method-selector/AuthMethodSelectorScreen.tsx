import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { router } from 'expo-router';

import AppleSignInButton from '@/components/screens/auth/oauth/AppleSignInButton';
import GoogleSignInButton from '@/components/screens/auth/oauth/GoogleSignInButton';
import MainButton from '@/components/ui/buttons/MainButton';
import PageTitle from '@/components/ui/text/PageTitle';
import { useSession } from '@/contexts/authContext';
import useToast from '@/hooks/ui/useToast';

export default function AuthMethodSelectorScreen() {
	const { t } = useTranslation();
	const { showSuccessToast } = useToast();
	const { user, isLoading } = useSession();
	const [authType, setAuthType] = useState<'login' | 'signup' | null>(null);

	const handleEmailAuth = () => {
		if (authType === 'login') {
			router.push('/login');
		} else if (authType === 'signup') {
			router.push('/sign-up');
		}
	};

	return (
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
				<PageTitle
					content={
						authType === null
							? t('auth.titles.welcome')
							: authType === 'login'
								? t('auth.titles.login')
								: t('auth.titles.signup')
					}
				/>

				{authType === null ? (
					<View className="flex gap-5 w-full justify-center items-center px-12">
						<MainButton
							content={t('auth.buttons.login')}
							backgroundColor="bg-primary"
							onPressAction={() => setAuthType('login')}
						/>

						<MainButton
							content={t('auth.buttons.signUp')}
							backgroundColor="bg-secondary"
							onPressAction={() => setAuthType('signup')}
						/>
					</View>
				) : (
					<View className="flex gap-8 w-full justify-center items-center px-12">
						<View className="w-full gap-4">
							<AppleSignInButton />
							<GoogleSignInButton />
						</View>

						<View className="flex-row items-center gap-4 w-full">
							<View className="flex-1 h-px bg-gray-300" />
							<Text className="text-gray-500 text-sm">
								{t('auth.oauth.orContinueWith')}
							</Text>
							<View className="flex-1 h-px bg-gray-300" />
						</View>

						<MainButton
							content={t('auth.buttons.continueWithEmail')}
							backgroundColor="bg-gray-100"
							onPressAction={handleEmailAuth}
						/>

						<MainButton
							content={t('auth.buttons.back')}
							backgroundColor="bg-transparent"
							onPressAction={() => setAuthType(null)}
						/>
					</View>
				)}
			</View>
		</KeyboardAwareScrollView>
	);
}
