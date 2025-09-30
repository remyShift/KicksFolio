import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import OAuthButton from '@/components/ui/buttons/OAuthButton';
import { useAuth } from '@/hooks/auth/useAuth';
import useToast from '@/hooks/ui/useToast';

interface AppleSignInButtonProps {
	onClose?: () => void;
}

export default function AppleSignInButton({ onClose }: AppleSignInButtonProps) {
	const { t } = useTranslation();
	const { showErrorToast } = useToast();
	const { signInWithApple } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleAppleSignIn = async () => {
		if (Platform.OS !== 'ios') {
			showErrorToast(
				t('auth.error.appleNotAvailable'),
				t('auth.error.appleNotAvailableDescription')
			);
			return;
		}

		onClose?.();

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
