import { useCallback, useEffect, useState } from 'react';

import { NotificationHandler } from '@/domain/NotificationHandler';
import { notificationProxy } from '@/tech/proxy/NotificationProxy';
import { Notification } from '@/types/notification';
import { groupNotificationsByWindow } from '@/utils/notificationHelpers';

const notificationHandler = new NotificationHandler(notificationProxy);

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchNotifications = useCallback(
		async (limit: number = 20, offset: number = 0) => {
			try {
				setIsLoading(true);
				setError(null);

				const fetchedNotifications =
					await notificationHandler.getNotifications(limit, offset);

				if (offset === 0) {
					// Group notifications to avoid duplicates in the same time window
					const groupedNotifications =
						groupNotificationsByWindow(fetchedNotifications);
					setNotifications(groupedNotifications);
				} else {
					setNotifications((prev) => {
						const combined = [...prev, ...fetchedNotifications];
						return groupNotificationsByWindow(combined);
					});
				}
			} catch (err) {
				console.error('Error fetching notifications:', err);
				setError(
					err instanceof Error
						? err.message
						: 'Failed to fetch notifications'
				);
			} finally {
				setIsLoading(false);
			}
		},
		[]
	);

	const fetchUnreadCount = useCallback(async () => {
		try {
			const count = await notificationHandler.getUnreadCount();
			setUnreadCount(count);
		} catch (err) {
			console.error('Error fetching unread count:', err);
		}
	}, []);

	const markAsRead = useCallback(
		async (notificationIds: string[]) => {
			try {
				await notificationHandler.markAsRead(notificationIds);

				setNotifications((prev) =>
					prev.map((notification) =>
						notificationIds.includes(notification.id)
							? { ...notification, is_read: true }
							: notification
					)
				);

				await fetchUnreadCount();
			} catch (err) {
				console.error('Error marking notifications as read:', err);
				setError(
					err instanceof Error
						? err.message
						: 'Failed to mark as read'
				);
			}
		},
		[fetchUnreadCount]
	);

	const markAllAsRead = useCallback(async () => {
		try {
			await notificationHandler.markAllAsRead();

			setNotifications((prev) =>
				prev.map((notification) => ({ ...notification, is_read: true }))
			);

			setUnreadCount(0);
		} catch (err) {
			console.error('Error marking all notifications as read:', err);
			setError(
				err instanceof Error
					? err.message
					: 'Failed to mark all as read'
			);
		}
	}, []);

	const deleteNotification = useCallback(
		async (notificationId: string) => {
			try {
				await notificationHandler.deleteNotification(notificationId);

				setNotifications((prev) =>
					prev.filter(
						(notification) => notification.id !== notificationId
					)
				);

				await fetchUnreadCount();
			} catch (err) {
				console.error('Error deleting notification:', err);
				setError(
					err instanceof Error
						? err.message
						: 'Failed to delete notification'
				);
			}
		},
		[fetchUnreadCount]
	);

	const refreshNotifications = useCallback(async () => {
		await Promise.all([fetchNotifications(20, 0), fetchUnreadCount()]);
	}, [fetchNotifications, fetchUnreadCount]);

	useEffect(() => {
		fetchUnreadCount();

		const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds

		return () => clearInterval(interval);
	}, [fetchUnreadCount]);

	return {
		notifications,
		unreadCount,
		isLoading,
		error,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		refreshNotifications,
		fetchUnreadCount,
	};
};
