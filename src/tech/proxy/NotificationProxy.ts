import { supabase } from '@/config/supabase/supabase';
import { NotificationHandlerInterface } from '@/domain/NotificationHandler';
import { DbNotification } from '@/types/database';
import {
	Notification,
	NotificationData,
	NotificationSettings,
	NotificationType,
} from '@/types/notification';

import { authProxy } from './AuthProxy';

export class NotificationProxy implements NotificationHandlerInterface {
	private async getRealUserId(): Promise<string> {
		let user;

		try {
			const {
				data: { user: authUser },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError) {
				if (
					authError.message?.includes('Auth session missing') ||
					authError.name === 'AuthSessionMissingError'
				) {
					throw new Error('User not authenticated');
				}
				throw authError;
			}

			if (!authUser) {
				throw new Error('User not authenticated');
			}

			user = authUser;
		} catch (error: any) {
			if (
				error.message?.includes('Auth session missing') ||
				error.name === 'AuthSessionMissingError'
			) {
				throw new Error('User not authenticated');
			}
			throw error;
		}

		const isOAuthProvider =
			user.app_metadata?.provider &&
			['google', 'apple'].includes(user.app_metadata.provider);

		if (isOAuthProvider) {
			try {
				const linkedUserId = await authProxy.findUserByOAuthAccount(
					user.app_metadata.provider as 'google' | 'apple',
					user.id
				);
				if (linkedUserId) {
					return linkedUserId;
				}
			} catch (linkError) {
				console.log(
					'ℹ️ No linked account found for OAuth user, using OAuth user ID'
				);
			}
		}

		return user.id;
	}
	async registerPushToken(
		expoPushToken: string,
		deviceId?: string
	): Promise<void> {
		const realUserId = await this.getRealUserId();

		await supabase
			.from('push_tokens')
			.update({ is_active: false })
			.eq('user_id', realUserId);

		const { error } = await supabase.from('push_tokens').insert([
			{
				user_id: realUserId,
				expo_token: expoPushToken,
				device_id: deviceId,
				is_active: true,
			},
		]);

		if (error) {
			if (error.code === '23505') {
				const { error: updateError } = await supabase
					.from('push_tokens')
					.update({
						user_id: realUserId,
						device_id: deviceId,
						is_active: true,
					})
					.eq('expo_token', expoPushToken);

				if (updateError) {
					throw updateError;
				}
			} else {
				throw error;
			}
		}
	}

	async unregisterPushToken(expoPushToken: string): Promise<void> {
		const { error } = await supabase
			.from('push_tokens')
			.update({ is_active: false })
			.eq('expo_token', expoPushToken);

		if (error) {
			throw error;
		}
	}

	async getNotifications(
		limit: number = 20,
		offset: number = 0
	): Promise<Notification[]> {
		const realUserId = await this.getRealUserId();

		const { data, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('recipient_id', realUserId)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			throw error;
		}

		return (data as DbNotification[]).map((dbNotification) => ({
			id: dbNotification.id,
			recipient_id: dbNotification.recipient_id,
			type: dbNotification.type as NotificationType,
			data: dbNotification.data as NotificationData,
			title: dbNotification.title,
			body: dbNotification.body,
			is_read: dbNotification.is_read,
			created_at: dbNotification.created_at,
			updated_at: dbNotification.updated_at,
		}));
	}

	async markAsRead(notificationIds: string[]): Promise<void> {
		const realUserId = await this.getRealUserId();

		const { error } = await supabase
			.from('notifications')
			.update({ is_read: true })
			.in('id', notificationIds)
			.eq('recipient_id', realUserId);

		if (error) {
			throw error;
		}
	}

	async markAllAsRead(): Promise<void> {
		const realUserId = await this.getRealUserId();

		const { error } = await supabase
			.from('notifications')
			.update({ is_read: true })
			.eq('recipient_id', realUserId)
			.eq('is_read', false);

		if (error) {
			throw error;
		}
	}

	async getUnreadCount(): Promise<number> {
		const realUserId = await this.getRealUserId();

		const { data, error } = await supabase.rpc(
			'get_unread_notification_count',
			{ user_uuid: realUserId }
		);

		if (error) {
			throw error;
		}

		return data || 0;
	}

	async deleteNotification(notificationId: string): Promise<void> {
		const realUserId = await this.getRealUserId();

		const { error } = await supabase
			.from('notifications')
			.delete()
			.eq('id', notificationId)
			.eq('recipient_id', realUserId);

		if (error) {
			throw error;
		}
	}

	async updateNotificationSettings(
		settings: Partial<NotificationSettings>
	): Promise<void> {
		const realUserId = await this.getRealUserId();

		const updateData: Partial<{
			following_additions_enabled: boolean;
			new_followers_enabled: boolean;
		}> = {};

		if (settings.following_additions_enabled !== undefined) {
			updateData.following_additions_enabled =
				settings.following_additions_enabled;
		}

		if (settings.new_followers_enabled !== undefined) {
			updateData.new_followers_enabled = settings.new_followers_enabled;
		}

		if (Object.keys(updateData).length > 0) {
			const { error } = await supabase
				.from('users')
				.update(updateData)
				.eq('id', realUserId);

			if (error) {
				throw error;
			}
		}
	}

	async getNotificationSettings(): Promise<NotificationSettings> {
		const realUserId = await this.getRealUserId();

		const { data, error } = await supabase
			.from('users')
			.select('following_additions_enabled, new_followers_enabled')
			.eq('id', realUserId)
			.single();

		if (error) {
			throw error;
		}

		return {
			push_notifications_enabled: true,
			following_additions_enabled:
				data.following_additions_enabled ?? true,
			new_followers_enabled: data.new_followers_enabled ?? true,
		};
	}

	async sendNotificationToFollowers(
		senderId: string,
		type: NotificationType,
		data: NotificationData
	): Promise<void> {
		const { error } = await supabase.functions.invoke(
			'send-follow-notifications',
			{
				body: {
					senderId,
					type,
					data,
				},
			}
		);

		if (error) {
			throw error;
		}
	}

	async sendFollowNotification(
		followerId: string,
		followingId: string
	): Promise<void> {
		const { data: followerData, error: followerError } = await supabase
			.from('users')
			.select('username, profile_picture, new_followers_enabled')
			.eq('id', followingId)
			.single();

		if (followerError || !followerData) {
			throw new Error('User not found');
		}

		if (!followerData.new_followers_enabled) {
			return;
		}

		const { data: followingUserData, error: followingUserError } =
			await supabase
				.from('users')
				.select('username, profile_picture')
				.eq('id', followerId)
				.single();

		if (followingUserError || !followingUserData) {
			throw new Error('Follower not found');
		}

		const { error: notificationError } = await supabase
			.from('notifications')
			.insert([
				{
					recipient_id: followingId,
					type: 'user_followed',
					data: {
						type: 'user_followed',
						follower_id: followerId,
						follower_username: followingUserData.username,
						follower_avatar: followingUserData.profile_picture,
					},
					title: `${followingUserData.username} a commencé à vous suivre`,
					body: `${followingUserData.username} a commencé à vous suivre.`,
				},
			]);

		if (notificationError) {
			throw notificationError;
		}

		const { data: pushTokens, error: tokensError } = await supabase
			.from('push_tokens')
			.select('expo_token')
			.eq('user_id', followingId)
			.eq('is_active', true);

		if (tokensError || !pushTokens || pushTokens.length === 0) {
			return;
		}

		const expoPushTokens = pushTokens.map((token) => token.expo_token);

		const messages = expoPushTokens.map((token) => ({
			to: token,
			title: `${followingUserData.username} a commencé à vous suivre`,
			body: `${followingUserData.username} a commencé à vous suivre.`,
			data: {
				type: 'user_followed',
				follower_id: followerId,
				follower_username: followingUserData.username,
			},
			sound: 'default',
		}));

		const response = await fetch('https://exp.host/--/api/v2/push/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(messages),
		});

		console.log('📱 Push notification response status:', response.status);
		console.log('📱 Push notification response headers:', response.headers);

		const responseText = await response.text();
		console.log('📱 Push notification response body:', responseText);

		if (!response.ok) {
			console.warn('Failed to send push notification for follow');
			console.error('📱 Push notification error details:', {
				status: response.status,
				statusText: response.statusText,
				body: responseText,
			});
		} else {
			console.log('✅ Push notification sent successfully');
		}
	}
}

export const notificationProxy = new NotificationProxy();
