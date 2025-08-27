import { useCallback, useEffect, useState } from 'react';

import { NotificationHandler } from '@/domain/NotificationHandler';
import { notificationProxy } from '@/tech/proxy/NotificationProxy';
import { NotificationSettings } from '@/types/notification';

const notificationHandler = new NotificationHandler(notificationProxy);

export const useNotificationSettings = () => {
	const [settings, setSettings] = useState<NotificationSettings>({
		push_notifications_enabled: true,
		following_additions_enabled: true,
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchSettings = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const fetchedSettings =
				await notificationHandler.getNotificationSettings();
			setSettings(fetchedSettings);
		} catch (err) {
			console.error('Error fetching notification settings:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to fetch settings'
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const updateSettings = useCallback(
		async (newSettings: Partial<NotificationSettings>) => {
			try {
				setIsLoading(true);
				setError(null);

				await notificationHandler.updateNotificationSettings(
					newSettings
				);

				setSettings((prev) => ({ ...prev, ...newSettings }));
			} catch (err) {
				console.error('Error updating notification settings:', err);
				setError(
					err instanceof Error
						? err.message
						: 'Failed to update settings'
				);
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const togglePushNotifications = useCallback(
		async (enabled: boolean) => {
			await updateSettings({ push_notifications_enabled: enabled });
		},
		[updateSettings]
	);

	const toggleFollowingAdditions = useCallback(
		async (enabled: boolean) => {
			await updateSettings({ following_additions_enabled: enabled });
		},
		[updateSettings]
	);

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	return {
		settings,
		isLoading,
		error,
		updateSettings,
		togglePushNotifications,
		toggleFollowingAdditions,
		refreshSettings: fetchSettings,
	};
};
