import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { router } from 'expo-router';

import { useAuth } from '@/hooks/auth/useAuth';
import useToast from '@/hooks/ui/useToast';

import SettingsCategory from '../shared/SettingsCategory';
import SettingsMenuItem from '../shared/SettingsMenuItem';
import Spacer from '../shared/Spacer';
import OAuthSettings from './OAuthSettings';

export default function AccountSettings() {
	const { t } = useTranslation();
	const { showSuccessToast } = useToast();
	const { logout } = useAuth();

	const handleLogout = () => {
		Alert.alert(t('alert.titles.logout'), t('alert.descriptions.logout'), [
			{
				text: t('alert.choices.cancel'),
				style: 'cancel',
			},
			{
				text: t('alert.choices.logout'),
				style: 'destructive',
				onPress: () => {
					logout();
					setTimeout(() => {
						showSuccessToast(
							t('alert.titles.loggedOut'),
							t('alert.descriptions.loggedOut')
						);
					}, 200);
				},
			},
		]);
	};

	return (
		<>
			<SettingsCategory title={t('settings.titles.account')}>
				<SettingsMenuItem
					icon="person-outline"
					label={t('settings.titles.editProfile')}
					onPress={() => router.push('/edit-profile')}
					testID="edit-profile"
				/>

				<Spacer />

				<SettingsMenuItem
					icon="share-social-outline"
					label={t('settings.titles.socialMedia')}
					onPress={() => router.push('/social-media')}
				/>

				<Spacer />

				<SettingsMenuItem
					icon="exit-outline"
					label={t('settings.titles.logout')}
					onPress={handleLogout}
					testID="logout"
				/>
			</SettingsCategory>

			<OAuthSettings />
		</>
	);
}
