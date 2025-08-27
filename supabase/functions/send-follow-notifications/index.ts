import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationRequest {
	senderId: string;
	type: 'single_sneaker_added' | 'multiple_sneakers_added';
	data: {
		sneaker?: {
			id: string;
			model: string;
			brand_name: string;
			image?: string;
		};
		sneaker_count?: number;
		user_id: string;
		username: string;
		user_avatar?: string;
	};
}

interface Follower {
	follower_id: string;
	users?: {
		id: string;
		username: string;
		push_notifications_enabled: boolean;
		following_additions_enabled: boolean;
	};
}

interface Collection {
	id: string;
	created_at: string;
	sneakers: {
		id: string;
		model: string;
		image?: string;
		brands?: {
			name: string;
		};
	};
}

interface PushToken {
	user_id: string;
	expo_token: string;
}

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const BATCHING_WINDOW_HOURS = 1;
const MIN_SNEAKERS_FOR_BATCH = 2;

serve(async (req: Request) => {
	try {
		if (req.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}

		const supabase = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
		);

		const { senderId }: NotificationRequest = await req.json();

		console.log(`Processing notification for user: ${senderId}`);

		const { data: senderData, error: senderError } = await supabase
			.from('users')
			.select('username, profile_picture')
			.eq('id', senderId)
			.single();

		if (senderError || !senderData) {
			console.error('Failed to fetch sender data:', senderError);
			return new Response('Sender not found', { status: 404 });
		}

		const { data: followers, error: followersError } = await supabase
			.from('followers')
			.select(
				`
        follower_id,
        users!followers_follower_id_fkey (
          id,
          username,
          following_additions_enabled
        )
      `
			)
			.eq('following_id', senderId);

		if (followersError) {
			console.error('Failed to fetch followers:', followersError);
			return new Response('Failed to fetch followers', { status: 500 });
		}

		if (!followers || followers.length === 0) {
			console.log('No followers found');
			return new Response('No followers', { status: 200 });
		}

		const notifiableFollowers = (followers as Follower[]).filter(
			(f: Follower) => f.users?.following_additions_enabled
		);

		if (notifiableFollowers.length === 0) {
			console.log('No followers with notifications enabled');
			return new Response('No notifiable followers', { status: 200 });
		}

		const windowStart = new Date();
		windowStart.setHours(windowStart.getHours() - BATCHING_WINDOW_HOURS);

		const { data: recentCollections, error: collectionsError } =
			await supabase
				.from('collections')
				.select(
					`
        id,
        created_at,
        sneakers (
          id,
          model,
          image,
          brands (name)
        )
      `
				)
				.eq('user_id', senderId)
				.gte('created_at', windowStart.toISOString())
				.order('created_at', { ascending: false });

		if (collectionsError) {
			console.error(
				'Failed to fetch recent collections:',
				collectionsError
			);
			return new Response('Failed to fetch collections', { status: 500 });
		}

		if (!recentCollections || recentCollections.length === 0) {
			console.log('No recent collections found');
			return new Response('No recent collections', { status: 200 });
		}

		const sneakerCount = recentCollections.length;
		let title: string;
		let body: string;
		let notificationType:
			| 'single_sneaker_added'
			| 'multiple_sneakers_added';
		let notificationData: any;

		if (sneakerCount >= MIN_SNEAKERS_FOR_BATCH) {
			notificationType = 'multiple_sneakers_added';
			title = `${senderData.username} a ajouté des sneakers!`;
			body = `${senderData.username} vient d'ajouter ${sneakerCount} paires à sa collection. Viens vite les voir!`;

			notificationData = {
				type: notificationType,
				sneaker_count: sneakerCount,
				user_id: senderId,
				username: senderData.username,
				user_avatar: senderData.profile_picture,
				sneakers: (recentCollections as Collection[])
					.slice(0, 3)
					.map((c: Collection) => ({
						id: c.sneakers.id,
						model: c.sneakers.model,
						brand_name: c.sneakers.brands?.name || 'Unknown',
						image: c.sneakers.image,
					})),
			};
		} else {
			const latestSneaker = (recentCollections as Collection[])[0];
			notificationType = 'single_sneaker_added';
			title = `${senderData.username} a ajouté une sneaker!`;
			body = `${senderData.username} vient d'ajouter les ${latestSneaker.sneakers.brands?.name} ${latestSneaker.sneakers.model} à sa collection!`;

			notificationData = {
				type: notificationType,
				sneaker: {
					id: latestSneaker.sneakers.id,
					model: latestSneaker.sneakers.model,
					brand_name:
						latestSneaker.sneakers.brands?.name || 'Unknown',
					image: latestSneaker.sneakers.image,
				},
				user_id: senderId,
				username: senderData.username,
				user_avatar: senderData.profile_picture,
			};
		}

		const followerIds = notifiableFollowers.map(
			(f: Follower) => f.follower_id
		);
		const { data: pushTokens, error: tokensError } = await supabase
			.from('push_tokens')
			.select('user_id, expo_token')
			.in('user_id', followerIds)
			.eq('is_active', true);

		if (tokensError) {
			console.error('Failed to fetch push tokens:', tokensError);
			return new Response('Failed to fetch push tokens', { status: 500 });
		}

		if (!pushTokens || pushTokens.length === 0) {
			console.log('No active push tokens found');
			return new Response('No active push tokens', { status: 200 });
		}

		const pushPromises = (pushTokens as PushToken[]).map(
			async (tokenData: PushToken) => {
				const { data: existingNotification } = await supabase
					.from('notifications')
					.select('id, created_at')
					.eq('recipient_id', tokenData.user_id)
					.in('type', [
						'single_sneaker_added',
						'multiple_sneakers_added',
					])
					.gte('created_at', windowStart.toISOString())
					.order('created_at', { ascending: false })
					.limit(1)
					.maybeSingle();

				const pushPayload = {
					to: tokenData.expo_token,
					title,
					body,
					data: notificationData,
					sound: 'default' as const,
				};

				const response = await fetch(EXPO_PUSH_ENDPOINT, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Accept-encoding': 'gzip, deflate',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(pushPayload),
				});

				if (!response.ok) {
					console.error(
						`Failed to send push notification to ${tokenData.expo_token}:`,
						await response.text()
					);
					return false;
				}

				if (existingNotification) {
					await supabase
						.from('notifications')
						.update({
							type: notificationType,
							data: notificationData,
							title,
							body,
							updated_at: new Date().toISOString(),
						})
						.eq('id', existingNotification.id);

					console.log(
						`Updated existing notification for user ${tokenData.user_id}`
					);
				} else {
					await supabase.from('notifications').insert([
						{
							recipient_id: tokenData.user_id,
							type: notificationType,
							data: notificationData,
							title,
							body,
							is_read: false,
						},
					]);

					console.log(
						`Created new notification for user ${tokenData.user_id}`
					);
				}

				return true;
			}
		);

		const results = await Promise.allSettled(pushPromises);
		const successCount = results.filter(
			(r: PromiseSettledResult<boolean>) =>
				r.status === 'fulfilled' && r.value
		).length;

		console.log(
			`Processed ${successCount} notifications out of ${pushTokens.length} attempts (${sneakerCount} sneakers, type: ${notificationType})`
		);

		return new Response(
			JSON.stringify({
				success: true,
				processedCount: successCount,
				totalFollowers: notifiableFollowers.length,
				sneakerCount,
				notificationType,
				windowStart: windowStart.toISOString(),
			}),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 200,
			}
		);
	} catch (error: unknown) {
		console.error('Error in send-follow-notifications function:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		return new Response(JSON.stringify({ error: errorMessage }), {
			headers: { 'Content-Type': 'application/json' },
			status: 500,
		});
	}
});
