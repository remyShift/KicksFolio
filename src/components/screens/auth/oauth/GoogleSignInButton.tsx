import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Ionicons } from '@expo/vector-icons';

import OAuthButton from '@/components/ui/buttons/OAuthButton';
import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';

export default function GoogleSignInButton() {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const { signInWithGoogle } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			await signInWithGoogle();
		} catch (error: any) {
			console.error('Google Sign-In error:', error);
			if (error.message.includes('canceled')) {
				return;
			}
			showErrorToast(
				t('auth.oauth.google.error'),
				error.message || t('auth.oauth.google.errorDescription')
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<OAuthButton
			onPress={handleGoogleSignIn}
			icon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
			text={
				isLoading
					? t('auth.oauth.google.loading')
					: t('auth.oauth.google.signIn')
			}
			backgroundColor="bg-white"
			textColor="text-black"
			borderColor="border-blue-500"
			isDisabled={isLoading}
		/>
	);
}
