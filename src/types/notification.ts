export enum NotificationType {
	SINGLE_SNEAKER_ADDED = 'single_sneaker_added',
	MULTIPLE_SNEAKERS_ADDED = 'multiple_sneakers_added',
	USER_FOLLOWED = 'user_followed',
}

export interface NotificationSneakerInfo {
	id: string;
	model: string;
	brand_name: string;
	image?: string;
}

export interface SingleSneakerNotificationData {
	type: NotificationType.SINGLE_SNEAKER_ADDED;
	sneaker: NotificationSneakerInfo;
	user_id: string;
	username: string;
	user_avatar?: string;
}

export interface MultipleSneakersNotificationData {
	type: NotificationType.MULTIPLE_SNEAKERS_ADDED;
	sneaker_count: number;
	user_id: string;
	username: string;
	user_avatar?: string;
	sneakers?: NotificationSneakerInfo[];
}

export interface UserFollowedNotificationData {
	type: NotificationType.USER_FOLLOWED;
	follower_id: string;
	follower_username: string;
	follower_avatar?: string;
}

export type NotificationData =
	| SingleSneakerNotificationData
	| MultipleSneakersNotificationData
	| UserFollowedNotificationData;

export interface Notification {
	id: string;
	recipient_id: string;
	type: NotificationType;
	data: NotificationData;
	title: string;
	body: string;
	is_read: boolean;
	created_at: string;
	updated_at: string;
}

export interface PushToken {
	id: string;
	user_id: string;
	expo_token: string;
	device_id?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface PushNotificationPayload {
	to: string;
	title: string;
	body: string;
	data?: Record<string, any>;
	sound?: 'default';
	badge?: number;
}

export interface NotificationSettings {
	push_notifications_enabled: boolean;
	following_additions_enabled: boolean;
	new_followers_enabled: boolean;
}
