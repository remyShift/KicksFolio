import { useCallback, useEffect, useState } from 'react';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { NotificationHandler } from '@/domain/NotificationHandler';
import { notificationProxy } from '@/tech/proxy/NotificationProxy';

const notificationHandler = new NotificationHandler(notificationProxy);

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export const usePushNotifications = () => {
	const [expoPushToken, setExpoPushToken] = useState<string>('');
	const [permission, setPermission] = useState<string>('undetermined');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const registerForPushNotificationsAsync = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			if (!Device.isDevice) {
				setError('Must use physical device for Push Notifications');
				return null;
			}

			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } =
					await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}

			setPermission(finalStatus);

			if (finalStatus !== 'granted') {
				setError('Permission not granted for push notifications');
				return null;
			}

			const token = (
				await Notifications.getExpoPushTokenAsync({
					projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
				})
			).data;

			if (token) {
				setExpoPushToken(token);

				await notificationHandler.registerPushToken(
					token,
					Device.osName ?? 'unknown'
				);

				console.log('✅ Push token registered:', token);
				return token;
			}

			return null;
		} catch (err) {
			console.error('Error registering for push notifications:', err);
			setError(
				err instanceof Error
					? err.message
					: 'Failed to register for push notifications'
			);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const unregisterPushToken = useCallback(async () => {
		try {
			if (expoPushToken) {
				await notificationHandler.unregisterPushToken(expoPushToken);
				setExpoPushToken('');
				console.log('✅ Push token unregistered');
			}
		} catch (err) {
			console.error('Error unregistering push token:', err);
			setError(
				err instanceof Error
					? err.message
					: 'Failed to unregister push token'
			);
		}
	}, [expoPushToken]);

	const checkPermissions = useCallback(async () => {
		try {
			const { status } = await Notifications.getPermissionsAsync();
			setPermission(status);
			return status === 'granted';
		} catch (err) {
			console.error('Error checking permissions:', err);
			return false;
		}
	}, []);

	useEffect(() => {
		checkPermissions().then((hasPermission) => {
			if (hasPermission) {
				registerForPushNotificationsAsync();
			}
		});
	}, [checkPermissions, registerForPushNotificationsAsync]);

	const setBadgeCount = useCallback(async (count: number) => {
		try {
			await Notifications.setBadgeCountAsync(count);
		} catch (err) {
			console.error('Error setting badge count:', err);
		}
	}, []);

	return {
		expoPushToken,
		permission,
		isLoading,
		error,
		registerForPushNotifications: registerForPushNotificationsAsync,
		unregisterPushToken,
		checkPermissions,
		setBadgeCount,
		hasPermission: permission === 'granted',
	};
};
