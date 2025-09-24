import { supabase } from '@/config/supabase/supabase';
import { UserLookupInterface } from '@/domain/UserLookup';
import { DbCollectionWithSneaker, DbUser } from '@/types/database';
import { Sneaker } from '@/types/sneaker';
import { SearchUser, SearchUsersResponse } from '@/types/user';
import {
	mapDbCollectionToSneaker,
	mapDbUserToSearchUser,
	mapSupabaseCount,
} from '@/utils/mappers';

export class UserLookupProxy implements UserLookupInterface {
	private static readonly PAGE_SIZE = 20;

	async search(
		searchTerm: string,
		currentUserId: string,
		page: number = 0
	): Promise<SearchUsersResponse> {
		return Promise.resolve().then(() => {
			if (searchTerm.trim().length < 2) {
				return {
					users: [],
					hasMore: false,
					totalCount: 0,
				};
			}

			return this.searchDirectSQL(searchTerm, currentUserId, page).then(
				(res) => {
					return res;
				}
			);
		});
	}

	private async searchDirectSQL(
		searchTerm: string,
		currentUserId: string,
		page: number = 0
	): Promise<SearchUsersResponse> {
		const offset = page * UserLookupProxy.PAGE_SIZE;
		const searchPattern = `%${searchTerm.trim().toLowerCase()}%`;

		const { data: users, error } = await supabase
			.from('users')
			.select(
				`
				id,
				username,
				profile_picture,
				instagram_username,
				social_media_visibility
			`
			)
			.or(`username.ilike.${searchPattern}`)
			.neq('id', currentUserId)
			.range(offset, offset + UserLookupProxy.PAGE_SIZE);

		if (error) {
			console.error('[UserLookupProxy] searchDirectSQL:error', error);
			throw error;
		}

		const usersList = users || [];
		const hasMore = usersList.length > UserLookupProxy.PAGE_SIZE;
		const actualUsers = hasMore
			? usersList.slice(0, UserLookupProxy.PAGE_SIZE)
			: usersList;

		const enrichedUsers = await Promise.all(
			actualUsers.map(async (user) => {
				const dbUser = user as DbUser;
				return Promise.all([
					supabase
						.from('followers')
						.select('*', {
							count: 'exact',
							head: true,
						})
						.eq('following_id', dbUser.id),
					supabase
						.from('followers')
						.select('*', {
							count: 'exact',
							head: true,
						})
						.eq('follower_id', dbUser.id),
					supabase
						.from('followers')
						.select('id')
						.eq('follower_id', currentUserId)
						.eq('following_id', dbUser.id)
						.single(),
				])
					.then(
						([
							followersResult,
							followingResult,
							isFollowingResult,
						]) => {
							return mapDbUserToSearchUser(
								dbUser,
								mapSupabaseCount(followersResult),
								mapSupabaseCount(followingResult),
								!isFollowingResult.error &&
									!!isFollowingResult.data
							);
						}
					)
					.catch((error) => {
						console.warn(
							`Error enriching user ${dbUser.id}:`,
							error
						);
						return mapDbUserToSearchUser(dbUser, 0, 0, false);
					});
			})
		);

		return {
			users: enrichedUsers,
			hasMore,
			totalCount: enrichedUsers.length,
		};
	}

	async getProfile(
		userId: string,
		currentUserId: string
	): Promise<SearchUser | null> {
		try {
			const { data: dbUser, error } = await supabase
				.from('users')
				.select(
					`
					id,
					username,
					profile_picture,
					social_media_visibility,
					instagram_username
				`
				)
				.eq('id', userId)
				.single();

			if (error || !dbUser) {
				console.warn('[UserLookupProxy] getProfile:not-found', error);
				return null;
			}

			const [followersResult, followingResult, isFollowingResult] =
				await Promise.all([
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
					supabase
						.from('followers')
						.select('id')
						.eq('follower_id', currentUserId)
						.eq('following_id', userId)
						.single(),
				]);

			const result = mapDbUserToSearchUser(
				dbUser as DbUser,
				mapSupabaseCount(followersResult),
				mapSupabaseCount(followingResult),
				!isFollowingResult.error && !!isFollowingResult.data
			);

			return result;
		} catch (error) {
			console.warn(`Error getting user profile ${userId}:`, error);
			return null;
		}
	}

	async getSneakers(userId: string): Promise<Sneaker[]> {
		try {
			const { data: collections, error } = await supabase
				.from('collections')
				.select(
					`
					id,
					sneaker_id,
					size_eu,
					size_us,
					og_box,
					ds,
					purchase_date,
					price_paid,
					condition,
					estimated_value,
					images,
					wishlist,
					created_at,
					updated_at,
					status_id,
					sneakers (
						id,
						model,
						gender,
						sku,
						description,
						image,
						brands (
							id,
							name
						)
					)
				`
				)
				.eq('user_id', userId)
				.order('created_at', {
					ascending: false,
				});

			if (error) {
				console.error(
					`Error fetching sneakers for user ${userId}:`,
					error
				);
				return [];
			}

			const result =
				collections?.map((dbCollection: any) =>
					mapDbCollectionToSneaker(dbCollection)
				) || [];

			return result;
		} catch (error) {
			console.error(
				`Exception getting user sneakers for ${userId}:`,
				error
			);
			return [];
		}
	}
}

export const userLookupProxy = new UserLookupProxy();
