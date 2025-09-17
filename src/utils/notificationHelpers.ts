import { Notification, NotificationType } from '@/types/notification';

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
				const senderId =
					'user_id' in notification.data
						? notification.data.user_id
						: null;
				if (!senderId) return;

				const notificationTime = new Date(notification.created_at);
				const windowKey = `${senderId}-${Math.floor(notificationTime.getTime() / (windowSizeHours * 60 * 60 * 1000))}`;

				if (!grouped.has(windowKey)) {
					grouped.set(windowKey, notification);
				}
			} else {
				grouped.set(notification.id, notification);
			}
		});

	return Array.from(grouped.values()).sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);
};

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

export const isSneakerAdditionNotification = (
	notification: Notification
): boolean => {
	return (
		notification.type === NotificationType.SINGLE_SNEAKER_ADDED ||
		notification.type === NotificationType.MULTIPLE_SNEAKERS_ADDED
	);
};

export const getNotificationWindow = (date: Date): Date => {
	const window = new Date(date);
	window.setMinutes(0, 0, 0);
	return window;
};
