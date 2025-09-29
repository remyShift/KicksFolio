import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { router } from 'expo-router';

import AppleSignInButton from '@/components/screens/auth/oauth/AppleSignInButton';
import GoogleSignInButton from '@/components/screens/auth/oauth/GoogleSignInButton';

interface AuthMethodModalProps {
	onClose: () => void;
	mode: 'login' | 'signup' | null;
}

export default function AuthMethodModal({
	onClose,
	mode,
}: AuthMethodModalProps) {
	const { t } = useTranslation();

	const handleEmailAuth = () => {
		onClose();
		if (mode === 'login') {
			router.push('/login');
		} else if (mode === 'signup') {
			router.push('/sign-up');
		}
	};

	const getTitle = () => {
		if (mode === 'login') {
			return t('auth.titles.login');
		} else if (mode === 'signup') {
			return t('auth.titles.signup');
		}
		return '';
	};

	return (
		<View className="px-6 py-8 flex-1">
			<Text className="text-2xl font-bold text-gray-900 mb-8 text-center">
				{getTitle()}
			</Text>

			<View className="gap-4 mb-6">
				<AppleSignInButton onClose={onClose} />
				<GoogleSignInButton onClose={onClose} />
			</View>

			<View className="flex-row items-center gap-4 mb-6">
				<View className="flex-1 h-px bg-gray-300" />
				<Text className="text-gray-500 text-sm">
					{t('auth.oauth.orContinueWith')}
				</Text>
				<View className="flex-1 h-px bg-gray-300" />
			</View>

			<Pressable className="" onPress={handleEmailAuth}>
				<Text className="text-primary text-center font-open-sans-bold">
					{t('auth.buttons.continueWithEmail')}
				</Text>
			</Pressable>
		</View>
	);
}
