import { useEffect, useRef } from 'react';

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { NotificationType } from '@/types/notification';

export const useNotificationNavigation = () => {
	const notificationListener = useRef<Notifications.EventSubscription | null>(
		null
	);
	const responseListener = useRef<Notifications.EventSubscription | null>(
		null
	);

	useEffect(() => {
		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log(
					'📱 Notification received:',
					notification.request.content
				);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					console.log('📱 Notification clicked:', response);

					const data = response.notification.request.content.data;
					const type = data?.type as NotificationType | undefined;

					if (!type) {
						console.warn('No notification type found in data');
						return;
					}

					const userId = extractUserIdFromNotification(type, data);

					if (userId) {
						console.log('📱 Navigating to user profile:', userId);
						router.push(`/(app)/(tabs)/search/${userId}`);
					}
				}
			);

		return () => {
			if (notificationListener.current) {
				notificationListener.current.remove();
			}
			if (responseListener.current) {
				responseListener.current.remove();
			}
		};
	}, []);
};

const extractUserIdFromNotification = (
	type: NotificationType,
	data: any
): string | undefined => {
	switch (type) {
		case NotificationType.USER_FOLLOWED:
			return data.follower_id;

		case NotificationType.SINGLE_SNEAKER_ADDED:
		case NotificationType.MULTIPLE_SNEAKERS_ADDED:
			return data.user_id;

		default:
			return undefined;
	}
};
