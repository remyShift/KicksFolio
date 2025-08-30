import {
	Notification,
	NotificationData,
	NotificationSettings,
	NotificationType,
	PushToken,
} from '@/types/notification';

export interface NotificationHandlerInterface {
	registerPushToken: (
		expoPushToken: string,
		deviceId?: string
	) => Promise<void>;
	unregisterPushToken: (expoPushToken: string) => Promise<void>;
	getNotifications: (
		limit?: number,
		offset?: number
	) => Promise<Notification[]>;
	markAsRead: (notificationIds: string[]) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	getUnreadCount: () => Promise<number>;
	deleteNotification: (notificationId: string) => Promise<void>;
	updateNotificationSettings: (
		settings: Partial<NotificationSettings>
	) => Promise<void>;
	getNotificationSettings: () => Promise<NotificationSettings>;
	sendNotificationToFollowers: (
		senderId: string,
		type: NotificationType,
		data: NotificationData
	) => Promise<void>;
	sendFollowNotification: (
		followerId: string,
		followingId: string
	) => Promise<void>;
}

export class NotificationHandler {
	constructor(
		private readonly notificationProvider: NotificationHandlerInterface
	) {}

	registerPushToken = async (expoPushToken: string, deviceId?: string) => {
		return this.notificationProvider
			.registerPushToken(expoPushToken, deviceId)
			.then(() => {
				console.log(
					'✅ NotificationHandler: Push token registered successfully'
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.registerPushToken: Error occurred:',
					error
				);
				throw error;
			});
	};

	unregisterPushToken = async (expoPushToken: string) => {
		return this.notificationProvider
			.unregisterPushToken(expoPushToken)
			.then(() => {
				console.log(
					'✅ NotificationHandler: Push token unregistered successfully'
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.unregisterPushToken: Error occurred:',
					error
				);
				throw error;
			});
	};

	getNotifications = async (limit: number = 20, offset: number = 0) => {
		return this.notificationProvider
			.getNotifications(limit, offset)
			.then((notifications) => {
				return notifications;
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.getNotifications: Error occurred:',
					error
				);
				throw error;
			});
	};

	markAsRead = async (notificationIds: string[]) => {
		return this.notificationProvider
			.markAsRead(notificationIds)
			.then(() => {
				console.log(
					`✅ NotificationHandler: ${notificationIds.length} notifications marked as read`
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.markAsRead: Error occurred:',
					error
				);
				throw error;
			});
	};

	markAllAsRead = async () => {
		return this.notificationProvider
			.markAllAsRead()
			.then(() => {
				console.log(
					'✅ NotificationHandler: All notifications marked as read'
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.markAllAsRead: Error occurred:',
					error
				);
				throw error;
			});
	};

	getUnreadCount = async () => {
		return this.notificationProvider
			.getUnreadCount()
			.then((count) => {
				return count;
			})
			.catch((error) => {
				console.warn(
					'❌ NotificationHandler.getUnreadCount: Error occurred:',
					error
				);
				throw error;
			});
	};

	deleteNotification = async (notificationId: string) => {
		return this.notificationProvider
			.deleteNotification(notificationId)
			.then(() => {
				console.log(
					'✅ NotificationHandler: Notification deleted successfully'
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.deleteNotification: Error occurred:',
					error
				);
				throw error;
			});
	};

	updateNotificationSettings = async (
		settings: Partial<NotificationSettings>
	) => {
		return this.notificationProvider
			.updateNotificationSettings(settings)
			.then(() => {
				console.log(
					'✅ NotificationHandler: Settings updated successfully'
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.updateNotificationSettings: Error occurred:',
					error
				);
				throw error;
			});
	};

	getNotificationSettings = async () => {
		return this.notificationProvider
			.getNotificationSettings()
			.then((settings) => {
				return settings;
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.getNotificationSettings: Error occurred:',
					error
				);
				throw error;
			});
	};

	sendNotificationToFollowers = async (
		senderId: string,
		type: NotificationType,
		data: NotificationData
	) => {
		return this.notificationProvider
			.sendNotificationToFollowers(senderId, type, data)
			.then(() => {
				console.log(
					'✅ NotificationHandler: Notification sent to followers'
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.sendNotificationToFollowers: Error occurred:',
					error
				);
				throw error;
			});
	};

	sendFollowNotification = async (
		followerId: string,
		followingId: string
	) => {
		return this.notificationProvider
			.sendFollowNotification(followerId, followingId)
			.then(() => {
				console.log(
					'✅ NotificationHandler: Follow notification sent successfully'
				);
			})
			.catch((error) => {
				console.error(
					'❌ NotificationHandler.sendFollowNotification: Error occurred:',
					error
				);
				throw error;
			});
	};
}
