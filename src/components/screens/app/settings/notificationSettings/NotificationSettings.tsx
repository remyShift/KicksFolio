import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { AppState, Linking, Platform } from 'react-native';

import Constants from 'expo-constants';

import useToast from '@/hooks/ui/useToast';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';

import SettingsCategory from '../shared/SettingsCategory';
import SettingsMenuItem from '../shared/SettingsMenuItem';
import Spacer from '../shared/Spacer';
import NotificationToggle from './NotificationToggle';

export default function NotificationSettings() {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const { hasPermission, checkPermissions } = usePushNotifications();
	const { settings, isLoading, toggleFollowingAdditions } =
		useNotificationSettings();

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
		</SettingsCategory>
	);
}
