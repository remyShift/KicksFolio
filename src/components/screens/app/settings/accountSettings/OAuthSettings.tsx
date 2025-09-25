import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';

import { useAuth } from '@/hooks/auth/useAuth';
import useToast from '@/hooks/ui/useToast';

import SettingsCategory from '../shared/SettingsCategory';
import SettingsMenuItem from '../shared/SettingsMenuItem';
import Spacer from '../shared/Spacer';

export default function OAuthSettings() {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const {
		linkWithApple,
		linkWithGoogle,
		unlinkProvider,
		getLinkedProviders,
	} = useAuth();

	const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadLinkedProviders();
	}, []);

	const loadLinkedProviders = async () => {
		try {
			const providers = await getLinkedProviders();
			setLinkedProviders(providers);
		} catch (error) {
			console.error('Error loading linked providers:', error);
		}
	};

	const handleLinkApple = async () => {
		if (Platform.OS !== 'ios') {
			showErrorToast(
				t('auth.error.appleNotAvailable'),
				t('auth.error.appleNotAvailableDescription')
			);
			return;
		}

		setLoading(true);
		try {
			await linkWithApple();
			await loadLinkedProviders();
			showSuccessToast(
				t('settings.oauth.apple.linked'),
				t('settings.oauth.apple.linkedDescription')
			);
		} catch (error: any) {
			if (error.message.includes('canceled')) {
				return;
			}
			showErrorToast(
				t('settings.oauth.apple.linkError'),
				error.message || t('settings.oauth.apple.linkErrorDescription')
			);
		} finally {
			setLoading(false);
		}
	};

	const handleLinkGoogle = async () => {
		setLoading(true);
		try {
			await linkWithGoogle();
			await loadLinkedProviders();
			showSuccessToast(
				t('settings.oauth.google.linked'),
				t('settings.oauth.google.linkedDescription')
			);
		} catch (error: any) {
			if (error.message.includes('canceled')) {
				return;
			}
			showErrorToast(
				t('settings.oauth.google.linkError'),
				error.message || t('settings.oauth.google.linkErrorDescription')
			);
		} finally {
			setLoading(false);
		}
	};

	const handleUnlinkProvider = (provider: 'google' | 'apple') => {
		Alert.alert(
			t('settings.oauth.unlink.title'),
			t('settings.oauth.unlink.description', { provider }),
			[
				{
					text: t('alert.choices.cancel'),
					style: 'cancel',
				},
				{
					text: t('settings.oauth.unlink.confirm'),
					style: 'destructive',
					onPress: async () => {
						setLoading(true);
						try {
							await unlinkProvider(provider);
							await loadLinkedProviders();
							showSuccessToast(
								t('settings.oauth.unlinked'),
								t('settings.oauth.unlinkedDescription', {
									provider,
								})
							);
						} catch (error: any) {
							showErrorToast(
								t('settings.oauth.unlinkError'),
								error.message ||
									t('settings.oauth.unlinkErrorDescription')
							);
						} finally {
							setLoading(false);
						}
					},
				},
			]
		);
	};

	const isAppleLinked = linkedProviders.includes('apple');
	const isGoogleLinked = linkedProviders.includes('google');

	return (
		<SettingsCategory title={t('settings.titles.connectedAccounts')}>
			{Platform.OS === 'ios' && (
				<>
					<SettingsMenuItem
						icon={isAppleLinked ? 'checkmark-circle' : 'logo-apple'}
						label={
							isAppleLinked
								? t('settings.oauth.apple.linked')
								: t('settings.oauth.apple.link')
						}
						onPress={
							isAppleLinked
								? () => handleUnlinkProvider('apple')
								: handleLinkApple
						}
						color={isAppleLinked ? '#10b981' : '#000000'}
						textColor={isAppleLinked ? '#10b981' : '#000000'}
						disabled={loading}
						testID="apple-oauth"
					/>
					<Spacer />
				</>
			)}

			<SettingsMenuItem
				icon={isGoogleLinked ? 'checkmark-circle' : 'logo-google'}
				label={
					isGoogleLinked
						? t('settings.oauth.google.linked')
						: t('settings.oauth.google.link')
				}
				onPress={
					isGoogleLinked
						? () => handleUnlinkProvider('google')
						: handleLinkGoogle
				}
				color={isGoogleLinked ? '#10b981' : '#4285F4'}
				textColor={isGoogleLinked ? '#10b981' : '#4285F4'}
				disabled={loading}
				testID="google-oauth"
			/>
		</SettingsCategory>
	);
}
