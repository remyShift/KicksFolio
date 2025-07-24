import { Sneaker } from '@/types/Sneaker';
import { supabase } from './supabase';

export interface SearchUser {
	id: string;
	username: string;
	first_name: string;
	last_name: string;
	profile_picture: string | null;
	is_following: boolean;
	followers_count: number;
	following_count: number;
	instagram_username?: string;
	social_media_visibility?: boolean;
	sneakers: Sneaker[];
}

export interface SearchUsersResponse {
	users: SearchUser[];
	hasMore: boolean;
	totalCount: number;
}

export class UserSearchService {
	private static readonly PAGE_SIZE = 20;

	static async searchUsers(
		searchTerm: string,
		currentUserId: string,
		page: number = 0
	): Promise<SearchUsersResponse> {
		if (searchTerm.trim().length < 2) {
			return {
				users: [],
				hasMore: false,
				totalCount: 0,
			};
		}

		return this.searchUsersDirectSQL(searchTerm, currentUserId, page);
	}

	private static async searchUsersDirectSQL(
		searchTerm: string,
		currentUserId: string,
		page: number = 0
	): Promise<SearchUsersResponse> {
		const offset = page * this.PAGE_SIZE;
		const searchPattern = `%${searchTerm.trim().toLowerCase()}%`;

		const { data: users, error } = await supabase
			.from('users')
			.select(
				`
				id,
				username,
				first_name,
				last_name,
				profile_picture,
				instagram_username,
				social_media_visibility
			`
			)
			.or(
				`username.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`
			)
			.neq('id', currentUserId)
			.range(offset, offset + this.PAGE_SIZE);

		if (error) {
			throw error;
		}

		const usersList = users || [];
		const hasMore = usersList.length > this.PAGE_SIZE;
		const actualUsers = hasMore
			? usersList.slice(0, this.PAGE_SIZE)
			: usersList;

		const enrichedUsers = await Promise.all(
			actualUsers.map(async (user: any) => {
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
							.eq('follower_id', currentUserId)
							.eq('following_id', user.id)
							.single(),
					]);

					return {
						...user,
						followers_count: followersResult.error
							? 0
							: Number(followersResult.count || 0),
						following_count: followingResult.error
							? 0
							: Number(followingResult.count || 0),
						is_following:
							!isFollowingResult.error &&
							!!isFollowingResult.data,
					};
				} catch (error) {
					console.warn(`Error enriching user ${user.id}:`, error);
					return {
						...user,
						followers_count: 0,
						following_count: 0,
						is_following: false,
					};
				}
			})
		);

		return {
			users: enrichedUsers,
			hasMore,
			totalCount: enrichedUsers.length,
		};
	}

	static async getUserProfile(
		userId: string,
		currentUserId: string
	): Promise<SearchUser | null> {
		try {
			const { data: user, error } = await supabase
				.from('users')
				.select(
					`
					id,
					username,
					first_name,
					last_name,
					profile_picture,
					social_media_visibility,
					instagram_username,
					social_media_visibility
				`
				)
				.eq('id', userId)
				.single();

			if (error || !user) {
				return null;
			}

			const [followersResult, followingResult, isFollowingResult] =
				await Promise.all([
					supabase
						.from('followers')
						.select('*', { count: 'exact', head: true })
						.eq('following_id', userId),
					supabase
						.from('followers')
						.select('*', { count: 'exact', head: true })
						.eq('follower_id', userId),
					supabase
						.from('followers')
						.select('id')
						.eq('follower_id', currentUserId)
						.eq('following_id', userId)
						.single(),
				]);

			const finalFollowersCount = followersResult.error
				? 0
				: followersResult.count || 0;
			const finalFollowingCount = followingResult.error
				? 0
				: followingResult.count || 0;
			const isFollowing =
				!isFollowingResult.error && !!isFollowingResult.data;

			return {
				...user,
				followers_count: finalFollowersCount,
				following_count: finalFollowingCount,
				is_following: isFollowing,
				sneakers: [],
			};
		} catch (error) {
			console.warn(`Error getting user profile ${userId}:`, error);
			return null;
		}
	}

	static async getUserSneakers(userId: string): Promise<any[]> {
		try {
			console.log(
				'🔍 [UserSearchService] Fetching sneakers for user:',
				userId
			);

			const { data: userExists, error: userError } = await supabase
				.from('users')
				.select('id, username')
				.eq('id', userId)
				.single();

			console.log('👤 [UserSearchService] User check:', {
				userId,
				userExists: !!userExists,
				username: userExists?.username,
				userError: userError?.message,
			});

			console.log(
				'📋 [UserSearchService] Executing query: SELECT * FROM sneakers WHERE user_id =',
				userId
			);

			const {
				data: sneakers,
				error,
				count,
				status,
				statusText,
			} = await supabase
				.from('sneakers')
				.select('*', { count: 'exact' })
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			console.log('📊 [UserSearchService] Raw query result:', {
				userId,
				status,
				statusText,
				count,
				dataLength: sneakers?.length || 0,
				error: error
					? {
							message: error.message,
							details: error.details,
							hint: error.hint,
							code: error.code,
					  }
					: null,
				rawDataSample: sneakers?.slice(0, 1) || [],
			});

			if (error) {
				console.error(
					`❌ [UserSearchService] Error fetching sneakers for user ${userId}:`,
					{
						error,
						status,
						statusText,
						userId,
					}
				);
				return [];
			}

			console.log('🔄 [UserSearchService] Testing alternative query...');
			const { data: allSneakers, error: allError } = await supabase
				.from('sneakers')
				.select('id, user_id, model, brand')
				.limit(5);

			console.log(
				'🗂️ [UserSearchService] Sample of all sneakers in DB:',
				{
					totalSample: allSneakers?.length || 0,
					sample: allSneakers || [],
					error: allError?.message,
					targetUserId: userId,
				}
			);

			console.log(
				'✅ [UserSearchService] Sneakers fetched successfully:',
				{
					userId,
					count: sneakers?.length || 0,
					totalFromCount: count,
					preview:
						sneakers?.slice(0, 2).map((s) => ({
							id: s.id,
							model: s.model,
							brand: s.brand,
							user_id: s.user_id,
							created_at: s.created_at,
						})) || [],
				}
			);

			return sneakers || [];
		} catch (error) {
			console.error(
				`❌ [UserSearchService] Exception getting user sneakers for ${userId}:`,
				error
			);
			return [];
		}
	}
}
