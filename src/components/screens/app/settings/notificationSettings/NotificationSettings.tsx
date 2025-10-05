import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { AppState, Linking, Platform } from 'react-native';

import Constants from 'expo-constants';

import { useSession } from '@/contexts/authContext';
import { useNotificationSettings } from '@/hooks/notifications/useNotificationSettings';
import { usePushNotifications } from '@/hooks/notifications/usePushNotifications';
import useToast from '@/hooks/ui/useToast';

import SettingsCategory from '../shared/SettingsCategory';
import SettingsMenuItem from '../shared/SettingsMenuItem';
import Spacer from '../shared/Spacer';
import NotificationToggle from './NotificationToggle';

export default function NotificationSettings() {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const { hasPermission, checkPermissions } = usePushNotifications();
	const { user } = useSession();
	const { isLoading, toggleFollowingAdditions, toggleNewFollowers } =
		useNotificationSettings();

	const settings = user?.notification_preferences || {
		push_notifications_enabled: true,
		following_additions_enabled: true,
		new_followers_enabled: true,
	};

	const handleOpenSystemSettings = async () => {
		try {
			const appSettingsUrl =
				Platform.OS === 'ios'
					? 'app-settings:'
					: `package:${Constants.expoConfig?.ios?.bundleIdentifier || 'app.kicksfolio'}`;

			await Linking.openURL(appSettingsUrl);
		} catch (error) {
			console.error('Error opening app settings:', error);
			try {
				await Linking.openSettings();
			} catch (fallbackError) {
				console.error('Error opening system settings:', fallbackError);
				showErrorToast(
					t('settings.notifications.error'),
					t('settings.notifications.errorDescription')
				);
			}
		}
	};

	useEffect(() => {
		checkPermissions();

		const handleAppStateChange = (nextAppState: string) => {
			if (nextAppState === 'active') {
				checkPermissions();
			}
		};

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		);
		return () => subscription?.remove();
	}, [checkPermissions]);

	const handleFollowingAdditionsToggle = async (enabled: boolean) => {
		try {
			const hasSystemPermission = await checkPermissions();
			if (!hasSystemPermission) {
				showErrorToast(
					t('settings.notifications.permissionRequired'),
					t('settings.notifications.permissionDescription')
				);
				return;
			}

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

	const handleNewFollowersToggle = async (enabled: boolean) => {
		try {
			const hasSystemPermission = await checkPermissions();
			if (!hasSystemPermission) {
				showErrorToast(
					t('settings.notifications.permissionRequired'),
					t('settings.notifications.permissionDescription')
				);
				return;
			}

			await toggleNewFollowers(enabled);
			showSuccessToast(
				t('settings.notifications.newFollowersTitle'),
				enabled
					? t('settings.notifications.newFollowersEnabled')
					: t('settings.notifications.newFollowersDisabled')
			);
		} catch (error) {
			console.error('Error toggling new followers:', error);
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
				label={`${t('settings.notifications.pushNotifications')} ${
					hasPermission
						? `(${t('settings.notifications.systemEnabled')})`
						: `(${t('settings.notifications.systemDisabled')})`
				}`}
				onPress={handleOpenSystemSettings}
				testID="push-notifications"
			/>

			<Spacer />

			<SettingsMenuItem
				icon="heart-outline"
				label={t('settings.notifications.followingAdditions')}
				rightElement={
					<NotificationToggle
						currentValue={settings.following_additions_enabled}
						onToggle={handleFollowingAdditionsToggle}
						disabled={isLoading || !hasPermission}
						testID="following-additions"
					/>
				}
				testID="following-additions"
			/>

			<SettingsMenuItem
				icon="people-outline"
				label={t('settings.notifications.newFollowers')}
				rightElement={
					<NotificationToggle
						currentValue={settings.new_followers_enabled}
						onToggle={handleNewFollowersToggle}
						disabled={isLoading || !hasPermission}
						testID="new-followers"
					/>
				}
				testID="new-followers"
			/>
		</SettingsCategory>
	);
}
