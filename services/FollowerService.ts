import { supabase } from './supabase';
import { SearchUser } from './UserSearchService';

export interface FollowingUser extends SearchUser {
	followed_at: string;
}

export class FollowerService {
	static async followUser(followingId: string): Promise<boolean> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.error('Authentication error:', authError);
			throw new Error('User not authenticated');
		}

		const { error } = await supabase.from('followers').insert([
			{
				follower_id: user.id,
				following_id: followingId,
			},
		]);

		if (error) {
			console.error('Error following user:', error);
			throw error;
		}

		return true;
	}

	static async unfollowUser(followingId: string): Promise<boolean> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.error('Authentication error:', authError);
			throw new Error('User not authenticated');
		}

		const { error } = await supabase
			.from('followers')
			.delete()
			.eq('follower_id', user.id)
			.eq('following_id', followingId);

		if (error) {
			console.error('Error unfollowing user:', error);
			throw error;
		}

		return true;
	}

	static async getFollowingUsers(userId: string): Promise<FollowingUser[]> {
		const { data, error } = await supabase
			.from('followers')
			.select(
				`
                created_at,
                users!followers_following_id_fkey (
                    id,
                    username,
                    first_name,
                    last_name,
                    profile_picture
                )
            `
			)
			.eq('follower_id', userId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching following users:', error);
			throw error;
		}

		if (!data) return [];

		// Get additional stats for each user
		const followingUsers = await Promise.all(
			data.map(async (follow: any) => {
				const user = follow.users;
				if (!user) return null;

				const [followersResult, followingResult] = await Promise.all([
					supabase.rpc('get_followers_count', { user_uuid: user.id }),
					supabase.rpc('get_following_count', { user_uuid: user.id }),
				]);

				return {
					id: user.id,
					username: user.username,
					first_name: user.first_name,
					last_name: user.last_name,
					profile_picture: user.profile_picture,
					is_following: true, // Obviously true since we're getting followed users
					followers_count: Number(followersResult.data || 0),
					following_count: Number(followingResult.data || 0),
					followed_at: follow.created_at,
				};
			})
		);

		return followingUsers.filter(
			(user) => user !== null
		) as FollowingUser[];
	}

	static async getFollowersOfUser(userId: string): Promise<SearchUser[]> {
		const { data, error } = await supabase
			.from('followers')
			.select(
				`
                created_at,
                users!followers_follower_id_fkey (
                    id,
                    username,
                    first_name,
                    last_name,
                    profile_picture
                )
            `
			)
			.eq('following_id', userId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching followers:', error);
			throw error;
		}

		if (!data) return [];

		// Get additional stats for each user
		const followers = await Promise.all(
			data.map(async (follow: any) => {
				const user = follow.users;
				if (!user) return null;

				const [followersResult, followingResult, isFollowingResult] =
					await Promise.all([
						supabase.rpc('get_followers_count', {
							user_uuid: user.id,
						}),
						supabase.rpc('get_following_count', {
							user_uuid: user.id,
						}),
						supabase.rpc('is_following', {
							follower_uuid: userId,
							following_uuid: user.id,
						}),
					]);

				return {
					id: user.id,
					username: user.username,
					first_name: user.first_name,
					last_name: user.last_name,
					profile_picture: user.profile_picture,
					is_following: Boolean(isFollowingResult.data || false),
					followers_count: Number(followersResult.data || 0),
					following_count: Number(followingResult.data || 0),
				};
			})
		);

		return followers.filter((user) => user !== null) as SearchUser[];
	}

	static async isFollowing(
		followerId: string,
		followingId: string
	): Promise<boolean> {
		const { data, error } = await supabase.rpc('is_following', {
			follower_uuid: followerId,
			following_uuid: followingId,
		});

		if (error) {
			console.error('Error checking follow status:', error);
			return false;
		}

		return Boolean(data);
	}

	static async getFollowCounts(
		userId: string
	): Promise<{ followers: number; following: number }> {
		const [followersResult, followingResult] = await Promise.all([
			supabase.rpc('get_followers_count', { user_uuid: userId }),
			supabase.rpc('get_following_count', { user_uuid: userId }),
		]);

		return {
			followers: Number(followersResult.data || 0),
			following: Number(followingResult.data || 0),
		};
	}
}
