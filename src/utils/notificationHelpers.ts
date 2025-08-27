import { Notification, NotificationType } from '@/types/notification';

/**
 * Groups notifications by sender and type, keeping only the most recent one per user per hour
 */
export const groupNotificationsByWindow = (
	notifications: Notification[]
): Notification[] => {
	const windowSizeHours = 1;
	const grouped = new Map<string, Notification>();

	notifications
		.sort(
			(a, b) =>
				new Date(b.created_at).getTime() -
				new Date(a.created_at).getTime()
		)
		.forEach((notification) => {
			if (
				notification.type === NotificationType.SINGLE_SNEAKER_ADDED ||
				notification.type === NotificationType.MULTIPLE_SNEAKERS_ADDED
			) {
				// Extract sender ID from notification data
				const senderId = notification.data.user_id;
				if (!senderId) return;

				// Create time window key (hour precision)
				const notificationTime = new Date(notification.created_at);
				const windowKey = `${senderId}-${Math.floor(notificationTime.getTime() / (windowSizeHours * 60 * 60 * 1000))}`;

				// Keep only the most recent notification per window
				if (!grouped.has(windowKey)) {
					grouped.set(windowKey, notification);
				}
			} else {
				// Keep non-sneaker notifications as-is
				grouped.set(notification.id, notification);
			}
		});

	return Array.from(grouped.values()).sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);
};

/**
 * Formats notification title and body for display
 */
export const formatNotificationContent = (notification: Notification) => {
	const { type, data } = notification;

	switch (type) {
		case NotificationType.SINGLE_SNEAKER_ADDED:
			if ('sneaker' in data) {
				return {
					title: `${data.username} a ajouté une sneaker!`,
					subtitle: `${data.sneaker.brand_name} ${data.sneaker.model}`,
				};
			}
			break;

		case NotificationType.MULTIPLE_SNEAKERS_ADDED:
			if ('sneaker_count' in data) {
				return {
					title: `${data.username} a ajouté ${data.sneaker_count} paires!`,
					subtitle: `Viens vite voir sa collection`,
				};
			}
			break;

		default:
			return {
				title: notification.title,
				subtitle: notification.body,
			};
	}

	return {
		title: notification.title,
		subtitle: notification.body,
	};
};

/**
 * Checks if a notification is from a followed user adding sneakers
 */
export const isSneakerAdditionNotification = (
	notification: Notification
): boolean => {
	return (
		notification.type === NotificationType.SINGLE_SNEAKER_ADDED ||
		notification.type === NotificationType.MULTIPLE_SNEAKERS_ADDED
	);
};

/**
 * Gets the time window start for a given date (hour precision)
 */
export const getNotificationWindow = (date: Date): Date => {
	const window = new Date(date);
	window.setMinutes(0, 0, 0);
	return window;
};
