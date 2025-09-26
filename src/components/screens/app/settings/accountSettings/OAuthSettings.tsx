import { useTranslation } from 'react-i18next';

import SettingsCategory from '@/components/screens/app/settings/shared/SettingsCategory';
import SettingsMenuItem from '@/components/screens/app/settings/shared/SettingsMenuItem';
import { useOAuthLinking } from '@/hooks/auth/useOAuthLinking';

import Spacer from '../shared/Spacer';

export default function OAuthSettings() {
	const { t } = useTranslation();
	const {
		isGoogleLinked,
		isAppleLinked,
		linkGoogleAccount,
		unlinkGoogleAccount,
		linkAppleAccount,
		unlinkAppleAccount,
		isLoading,
	} = useOAuthLinking();

	return (
		<SettingsCategory title={t('settings.titles.connectedAccounts')}>
			<SettingsMenuItem
				icon={isGoogleLinked ? 'checkmark-circle' : 'logo-google'}
				label={
					isGoogleLinked
						? t('settings.oauth.googleLinkedLabel')
						: 'Google'
				}
				onPress={
					isGoogleLinked ? unlinkGoogleAccount : linkGoogleAccount
				}
				color={isGoogleLinked ? '#10b981' : '#4285f4'}
				textColor={isGoogleLinked ? '#10b981' : '#000000'}
				testID="google-oauth-setting"
			/>

			<Spacer />

			<SettingsMenuItem
				icon={isAppleLinked ? 'checkmark-circle' : 'logo-apple'}
				label={
					isAppleLinked
						? t('settings.oauth.appleLinkedLabel')
						: 'Apple'
				}
				onPress={isAppleLinked ? unlinkAppleAccount : linkAppleAccount}
				color={isAppleLinked ? '#10b981' : '#000000'}
				textColor={isAppleLinked ? '#10b981' : '#000000'}
				testID="apple-oauth-setting"
			/>
		</SettingsCategory>
	);
}
