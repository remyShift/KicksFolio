import { supabase } from '@/config/supabase/supabase';
import { NotificationHandlerInterface } from '@/domain/NotificationHandler';
import { DbNotification, DbPushToken } from '@/types/database';
import {
	Notification,
	NotificationData,
	NotificationSettings,
	NotificationType,
} from '@/types/notification';

export class NotificationProxy implements NotificationHandlerInterface {
	async registerPushToken(
		expoPushToken: string,
		deviceId?: string
	): Promise<void> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		// Deactivate existing tokens for this user
		await supabase
			.from('push_tokens')
			.update({ is_active: false })
			.eq('user_id', user.id);

		// Insert new token
		const { error } = await supabase.from('push_tokens').insert([
			{
				user_id: user.id,
				expo_token: expoPushToken,
				device_id: deviceId,
				is_active: true,
			},
		]);

		if (error) {
			// If token already exists, update it
			if (error.code === '23505') {
				const { error: updateError } = await supabase
					.from('push_tokens')
					.update({
						user_id: user.id,
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
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const { data, error } = await supabase
			.from('notifications')
			.select('*')
			.eq('recipient_id', user.id)
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
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const { error } = await supabase
			.from('notifications')
			.update({ is_read: true })
			.in('id', notificationIds)
			.eq('recipient_id', user.id);

		if (error) {
			throw error;
		}
	}

	async markAllAsRead(): Promise<void> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const { error } = await supabase
			.from('notifications')
			.update({ is_read: true })
			.eq('recipient_id', user.id)
			.eq('is_read', false);

		if (error) {
			throw error;
		}
	}

	async getUnreadCount(): Promise<number> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const { data, error } = await supabase.rpc(
			'get_unread_notification_count',
			{ user_uuid: user.id }
		);

		if (error) {
			throw error;
		}

		return data || 0;
	}

	async deleteNotification(notificationId: string): Promise<void> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const { error } = await supabase
			.from('notifications')
			.delete()
			.eq('id', notificationId)
			.eq('recipient_id', user.id);

		if (error) {
			throw error;
		}
	}

	async updateNotificationSettings(
		settings: Partial<NotificationSettings>
	): Promise<void> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const updateData: Record<string, boolean> = {};
		if (settings.push_notifications_enabled !== undefined) {
			updateData.push_notifications_enabled =
				settings.push_notifications_enabled;
		}
		if (settings.following_additions_enabled !== undefined) {
			updateData.following_additions_enabled =
				settings.following_additions_enabled;
		}

		const { error } = await supabase
			.from('users')
			.update(updateData)
			.eq('id', user.id);

		if (error) {
			throw error;
		}
	}

	async getNotificationSettings(): Promise<NotificationSettings> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error('User not authenticated');
		}

		const { data, error } = await supabase
			.from('users')
			.select('push_notifications_enabled, following_additions_enabled')
			.eq('id', user.id)
			.single();

		if (error) {
			throw error;
		}

		return {
			push_notifications_enabled: data.push_notifications_enabled ?? true,
			following_additions_enabled:
				data.following_additions_enabled ?? true,
		};
	}

	async sendNotificationToFollowers(
		senderId: string,
		type: NotificationType,
		data: NotificationData
	): Promise<void> {
		// This will be handled by the Supabase Edge Function
		// We call it from here to trigger the notification sending process
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
}

export const notificationProxy = new NotificationProxy();
