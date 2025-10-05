import { useCallback, useState } from 'react';

import { useSession } from '@/contexts/authContext';
import { NotificationHandler } from '@/domain/NotificationHandler';
import { notificationProxy } from '@/tech/proxy/NotificationProxy';
import { NotificationSettings } from '@/types/notification';

const notificationHandler = new NotificationHandler(notificationProxy);

export const useNotificationSettings = () => {
	const { updateNotificationPreferences } = useSession();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const updateSettings = useCallback(
		async (newSettings: Partial<NotificationSettings>) => {
			try {
				setIsLoading(true);
				setError(null);

				await notificationHandler.updateNotificationSettings(
					newSettings
				);

				updateNotificationPreferences(newSettings);
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
		[updateNotificationPreferences]
	);

	const toggleFollowingAdditions = useCallback(
		async (enabled: boolean) => {
			await updateSettings({ following_additions_enabled: enabled });
		},
		[updateSettings]
	);

	const toggleNewFollowers = useCallback(
		async (enabled: boolean) => {
			await updateSettings({ new_followers_enabled: enabled });
		},
		[updateSettings]
	);

	return {
		isLoading,
		error,
		updateSettings,
		toggleFollowingAdditions,
		toggleNewFollowers,
	};
};
