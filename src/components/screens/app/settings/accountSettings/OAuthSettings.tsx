import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, Platform, Text, View } from 'react-native';

import { useAuth } from '@/hooks/auth/useAuth';
import useToast from '@/hooks/ui/useToast';

import SettingsCategory from '../shared/SettingsCategory';
import SettingsMenuItem from '../shared/SettingsMenuItem';
import Spacer from '../shared/Spacer';

export default function OAuthSettings() {
	const { t } = useTranslation();
	const { showErrorToast } = useToast();
	const { getLinkedProviders } = useAuth();

	const [linkedProviders, setLinkedProviders] = useState<string[]>([]);

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

	const handleShowComingSoon = (provider: string) => {
		Alert.alert(
			t('settings.oauth.comingSoon.title'),
			t('settings.oauth.comingSoon.description', { provider }),
			[
				{
					text: t('alert.choices.ok'),
					style: 'default',
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
						onPress={() => handleShowComingSoon('Apple')}
						color={isAppleLinked ? '#10b981' : '#9CA3AF'}
						textColor={isAppleLinked ? '#10b981' : '#6B7280'}
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
				onPress={() => handleShowComingSoon('Google')}
				color={isGoogleLinked ? '#10b981' : '#9CA3AF'}
				textColor={isGoogleLinked ? '#10b981' : '#6B7280'}
				testID="google-oauth"
			/>
		</SettingsCategory>
	);
}
