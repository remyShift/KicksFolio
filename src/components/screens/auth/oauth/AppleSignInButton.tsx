import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import OAuthButton from '@/components/ui/buttons/OAuthButton';
import { useSession } from '@/contexts/authContext';
import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';

export default function AppleSignInButton() {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const { signInWithApple } = useAuth();
	const { user } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	const handleAppleSignIn = async () => {
		if (Platform.OS !== 'ios') {
			showErrorToast(
				t('auth.error.appleNotAvailable'),
				t('auth.error.appleNotAvailableDescription')
			);
			return;
		}

		setIsLoading(true);
		try {
			await signInWithApple();
		} catch (error: any) {
			console.error('Apple Sign-In error:', error);
			if (error.message.includes('canceled')) {
				return;
			}
			showErrorToast(
				t('auth.oauth.apple.error'),
				error.message || t('auth.oauth.apple.errorDescription')
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (Platform.OS !== 'ios') {
		return null;
	}

	return (
		<OAuthButton
			onPress={handleAppleSignIn}
			icon={<Ionicons name="logo-apple" size={20} color="#fff" />}
			text={
				isLoading
					? t('auth.oauth.apple.loading')
					: t('auth.oauth.apple.signIn')
			}
			backgroundColor="bg-black"
			textColor="text-white"
			borderColor="border-black"
			isDisabled={isLoading}
		/>
	);
}
