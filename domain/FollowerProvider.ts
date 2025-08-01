import { supabase } from '../config/supabase/supabase';
import { SearchUser } from './UserSearchService';

export interface FollowingUser extends SearchUser {
	followed_at: string;
}

export class FollowerProvider {
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

		if (!data || data.length === 0) return [];

		const followingUsers = await Promise.all(
			data.map(async (follow: any) => {
				const user = follow.users;
				if (!user) return null;

				try {
					const [followersResult, followingResult] =
						await Promise.all([
							supabase
								.from('followers')
								.select('*', { count: 'exact', head: true })
								.eq('following_id', user.id),
							supabase
								.from('followers')
								.select('*', { count: 'exact', head: true })
								.eq('follower_id', user.id),
						]);

					return {
						id: user.id,
						username: user.username,
						first_name: user.first_name,
						last_name: user.last_name,
						profile_picture: user.profile_picture,
						is_following: true,
						followers_count: Number(followersResult.count || 0),
						following_count: Number(followingResult.count || 0),
						followed_at: follow.created_at,
					};
				} catch (userError) {
					console.warn(
						`Error processing user ${user.id}:`,
						userError
					);
					return {
						id: user.id,
						username: user.username,
						first_name: user.first_name,
						last_name: user.last_name,
						profile_picture: user.profile_picture,
						is_following: true,
						followers_count: 0,
						following_count: 0,
						followed_at: follow.created_at,
					};
				}
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

		if (!data || data.length === 0) return [];

		const followers = await Promise.all(
			data.map(async (follow: any) => {
				const user = follow.users;
				if (!user) return null;

				try {
					const [
						followersResult,
						followingResult,
						isFollowingResult,
					] = await Promise.all([
						supabase
							.from('followers')
							.select('*', { count: 'exact', head: true })
							.eq('following_id', user.id),
						supabase
							.from('followers')
							.select('*', { count: 'exact', head: true })
							.eq('follower_id', user.id),
						supabase
							.from('followers')
							.select('id')
							.eq('follower_id', userId)
							.eq('following_id', user.id)
							.single(),
					]);

					return {
						id: user.id,
						username: user.username,
						first_name: user.first_name,
						last_name: user.last_name,
						profile_picture: user.profile_picture,
						is_following:
							!isFollowingResult.error &&
							!!isFollowingResult.data,
						followers_count: Number(followersResult.count || 0),
						following_count: Number(followingResult.count || 0),
					};
				} catch (userError) {
					console.warn(
						`Error processing follower ${user.id}:`,
						userError
					);
					return {
						id: user.id,
						username: user.username,
						first_name: user.first_name,
						last_name: user.last_name,
						profile_picture: user.profile_picture,
						is_following: false,
						followers_count: 0,
						following_count: 0,
					};
				}
			})
		);

		return followers.filter((user) => user !== null) as SearchUser[];
	}

	static async isFollowing(
		followerId: string,
		followingId: string
	): Promise<boolean> {
		const { data, error } = await supabase
			.from('followers')
			.select('id')
			.eq('follower_id', followerId)
			.eq('following_id', followingId)
			.single();

		if (error) {
			return false;
		}

		return !!data;
	}

	static async getFollowCounts(
		userId: string
	): Promise<{ followers: number; following: number }> {
		const [followersResult, followingResult] = await Promise.all([
			supabase
				.from('followers')
				.select('*', { count: 'exact', head: true })
				.eq('following_id', userId),
			supabase
				.from('followers')
				.select('*', { count: 'exact', head: true })
				.eq('follower_id', userId),
		]);

		return {
			followers: Number(followersResult.count || 0),
			following: Number(followingResult.count || 0),
		};
	}
}

export const followerProvider = new FollowerProvider();
