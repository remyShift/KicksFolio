import { supabase } from '@/config/supabase/supabase';
import { FollowerInterface } from '@/interfaces/FollowerInterface';
import { FollowingUser, SearchUser } from '@/types/user';

export class FollowerProvider implements FollowerInterface {
	async followUser(followingId: string): Promise<boolean> {
		return supabase.auth
			.getUser()
			.then(({ data: { user }, error: authError }) => {
				if (authError || !user) {
					console.error('Authentication error:', authError);
					throw new Error('User not authenticated');
				}

				return supabase.from('followers').insert([
					{
						follower_id: user.id,
						following_id: followingId,
					},
				]);
			})
			.then(({ error }) => {
				if (error) {
					console.error('Error following user:', error);
					throw error;
				}
				return true;
			});
	}

	async unfollowUser(followingId: string): Promise<boolean> {
		return supabase.auth
			.getUser()
			.then(({ data: { user }, error: authError }) => {
				if (authError || !user) {
					console.error('Authentication error:', authError);
					throw new Error('User not authenticated');
				}

				return supabase
					.from('followers')
					.delete()
					.eq('follower_id', user.id)
					.eq('following_id', followingId);
			})
			.then(({ error }) => {
				if (error) {
					console.error('Error unfollowing user:', error);
					throw error;
				}
				return true;
			});
	}

	async getFollowingUsers(userId: string): Promise<FollowingUser[]> {
		return supabase
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
			.order('created_at', { ascending: false })
			.then(({ data, error }) => {
				if (error) {
					console.error('Error fetching following users:', error);
					throw error;
				}

				if (!data || data.length === 0) return [];

				return Promise.all(
					data.map((follow: any) => {
						const user = follow.users;
						if (!user) return null;

						return Promise.all([
							supabase
								.from('followers')
								.select('*', {
									count: 'exact',
									head: true,
								})
								.eq('following_id', user.id),
							supabase
								.from('followers')
								.select('*', {
									count: 'exact',
									head: true,
								})
								.eq('follower_id', user.id),
						])
							.then(([followersResult, followingResult]) => {
								return {
									id: user.id,
									username: user.username,
									first_name: user.first_name,
									last_name: user.last_name,
									profile_picture: user.profile_picture,
									is_following: true,
									followers_count: Number(
										followersResult.count || 0
									),
									following_count: Number(
										followingResult.count || 0
									),
									followed_at: follow.created_at,
								};
							})
							.catch((userError) => {
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
							});
					})
				);
			})
			.then((followingUsers) => {
				return followingUsers.filter(
					(user) => user !== null
				) as FollowingUser[];
			});
	}

	async getFollowersOfUser(userId: string): Promise<SearchUser[]> {
		return supabase
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
			.order('created_at', { ascending: false })
			.then(({ data, error }) => {
				if (error) {
					console.error('Error fetching followers:', error);
					throw error;
				}

				if (!data || data.length === 0) return [];

				return Promise.all(
					data.map((follow: any) => {
						const user = follow.users;
						if (!user) return null;

						return Promise.all([
							supabase
								.from('followers')
								.select('*', {
									count: 'exact',
									head: true,
								})
								.eq('following_id', user.id),
							supabase
								.from('followers')
								.select('*', {
									count: 'exact',
									head: true,
								})
								.eq('follower_id', user.id),
							supabase
								.from('followers')
								.select('id')
								.eq('follower_id', userId)
								.eq('following_id', user.id)
								.single(),
						])
							.then(
								([
									followersResult,
									followingResult,
									isFollowingResult,
								]) => {
									return {
										id: user.id,
										username: user.username,
										first_name: user.first_name,
										last_name: user.last_name,
										profile_picture: user.profile_picture,
										is_following:
											!isFollowingResult.error &&
											!!isFollowingResult.data,
										followers_count: Number(
											followersResult.count || 0
										),
										following_count: Number(
											followingResult.count || 0
										),
									};
								}
							)
							.catch((userError) => {
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
							});
					})
				);
			})
			.then((followers) => {
				return followers.filter(
					(user) => user !== null
				) as SearchUser[];
			});
	}

	async isFollowing(
		followerId: string,
		followingId: string
	): Promise<boolean> {
		return supabase
			.from('followers')
			.select('id')
			.eq('follower_id', followerId)
			.eq('following_id', followingId)
			.single()
			.then(({ data, error }) => {
				if (error) {
					return false;
				}
				return !!data;
			});
	}

	async getFollowCounts(
		userId: string
	): Promise<{ followers: number; following: number }> {
		return Promise.all([
			supabase
				.from('followers')
				.select('*', {
					count: 'exact',
					head: true,
				})
				.eq('following_id', userId),
			supabase
				.from('followers')
				.select('*', {
					count: 'exact',
					head: true,
				})
				.eq('follower_id', userId),
		]).then(([followersResult, followingResult]) => {
			return {
				followers: Number(followersResult.count || 0),
				following: Number(followingResult.count || 0),
			};
		});
	}
}

export const followerProvider = new FollowerProvider();
