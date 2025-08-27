import { useTranslation } from 'react-i18next';
import { Switch } from 'react-native';

import useToast from '@/hooks/ui/useToast';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';

import SettingsCategory from '../shared/SettingsCategory';
import SettingsMenuItem from '../shared/SettingsMenuItem';
import Spacer from '../shared/Spacer';

export default function NotificationSettings() {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const { hasPermission, registerForPushNotifications } =
		usePushNotifications();
	const {
		settings,
		isLoading,
		togglePushNotifications,
		toggleFollowingAdditions,
	} = useNotificationSettings();

	const handlePushNotificationToggle = async (enabled: boolean) => {
		try {
			if (enabled && !hasPermission) {
				// Request permission first if enabling
				const token = await registerForPushNotifications();
				if (!token) {
					showErrorToast(
						t('settings.notifications.permissionRequired'),
						t('settings.notifications.permissionDescription')
					);
					return;
				}
			}

			await togglePushNotifications(enabled);
			showSuccessToast(
				t('settings.notifications.pushTitle'),
				enabled
					? t('settings.notifications.pushEnabled')
					: t('settings.notifications.pushDisabled')
			);
		} catch (error) {
			console.error('Error toggling push notifications:', error);
			showErrorToast(
				t('settings.notifications.error'),
				t('settings.notifications.errorDescription')
			);
		}
	};

	const handleFollowingAdditionsToggle = async (enabled: boolean) => {
		try {
			await toggleFollowingAdditions(enabled);
			showSuccessToast(
				t('settings.notifications.followingTitle'),
				enabled
					? t('settings.notifications.followingEnabled')
					: t('settings.notifications.followingDisabled')
			);
		} catch (error) {
			console.error('Error toggling following additions:', error);
			showErrorToast(
				t('settings.notifications.error'),
				t('settings.notifications.errorDescription')
			);
		}
	};

	return (
		<SettingsCategory title={t('settings.titles.notifications')}>
			<SettingsMenuItem
				icon="notifications-outline"
				label={t('settings.notifications.pushNotifications')}
				subtitle={t('settings.notifications.pushDescription')}
				rightElement={
					<Switch
						value={settings.push_notifications_enabled}
						onValueChange={handlePushNotificationToggle}
						disabled={isLoading}
						trackColor={{ false: '#767577', true: '#81b0ff' }}
						thumbColor={
							settings.push_notifications_enabled
								? '#f5dd4b'
								: '#f4f3f4'
						}
					/>
				}
				testID="push-notifications"
			/>

			<Spacer />

			<SettingsMenuItem
				icon="heart-outline"
				label={t('settings.notifications.followingAdditions')}
				subtitle={t('settings.notifications.followingDescription')}
				rightElement={
					<Switch
						value={settings.following_additions_enabled}
						onValueChange={handleFollowingAdditionsToggle}
						disabled={
							isLoading || !settings.push_notifications_enabled
						}
						trackColor={{ false: '#767577', true: '#81b0ff' }}
						thumbColor={
							settings.following_additions_enabled
								? '#f5dd4b'
								: '#f4f3f4'
						}
					/>
				}
				testID="following-additions"
			/>
		</SettingsCategory>
	);
}
