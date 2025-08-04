import { Sneaker } from '@/types/sneaker';
import { supabase } from '@/config/supabase/supabase';
import { UserSearchInterface } from '@/interfaces/UserSearchInterface';

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

export class UserSearchProvider implements UserSearchInterface {
	private static readonly PAGE_SIZE = 20;

	async searchUsers(
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

			return this.searchUsersDirectSQL(searchTerm, currentUserId, page);
		});
	}

	private async searchUsersDirectSQL(
		searchTerm: string,
		currentUserId: string,
		page: number = 0
	): Promise<SearchUsersResponse> {
		const offset = page * UserSearchProvider.PAGE_SIZE;
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
			.range(offset, offset + UserSearchProvider.PAGE_SIZE);

		if (error) {
			throw error;
		}

		const usersList = users || [];
		const hasMore = usersList.length > UserSearchProvider.PAGE_SIZE;
		const actualUsers = hasMore
			? usersList.slice(0, UserSearchProvider.PAGE_SIZE)
			: usersList;

		const enrichedUsers = await Promise.all(
			actualUsers.map(async (user: any) => {
				return Promise.all([
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
				])
					.then(
						([
							followersResult,
							followingResult,
							isFollowingResult,
						]) => {
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
						}
					)
					.catch((error) => {
						console.warn(`Error enriching user ${user.id}:`, error);
						return {
							...user,
							followers_count: 0,
							following_count: 0,
							is_following: false,
						};
					});
			})
		);

		return {
			users: enrichedUsers,
			hasMore,
			totalCount: enrichedUsers.length,
		};
	}

	async getUserProfile(
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

	async getUserSneakers(userId: string): Promise<any[]> {
		try {
			const { data: sneakers, error } = await supabase
				.from('sneakers')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (error) {
				console.error(
					`Error fetching sneakers for user ${userId}:`,
					error
				);
				return [];
			}

			return (
				sneakers?.map((sneaker) => ({
					...sneaker,
					images: UserSearchProvider.parseImages(sneaker.images),
				})) || []
			);
		} catch (error) {
			console.error(
				`Exception getting user sneakers for ${userId}:`,
				error
			);
			return [];
		}
	}

	private static parseImages(images: any): { id: string; uri: string }[] {
		if (!images) return [];

		if (
			Array.isArray(images) &&
			images.length > 0 &&
			typeof images[0] === 'object' &&
			(images[0].uri || images[0].url)
		) {
			return images.map((img: any) => ({
				id: img.id || '',
				uri: img.uri || img.url || '',
			}));
		}

		if (Array.isArray(images)) {
			return images.map((img) => {
				if (typeof img === 'string') {
					try {
						const parsed = JSON.parse(img);
						return {
							id: parsed.id || '',
							uri: parsed.uri || parsed.url || '',
						};
					} catch (error) {
						console.warn('Error parsing image JSON:', error);
						return { id: '', uri: img };
					}
				}
				return { id: img.id || '', uri: img.uri || img.url || '' };
			});
		}

		if (typeof images === 'string') {
			try {
				const parsed = JSON.parse(images);
				if (Array.isArray(parsed)) {
					return parsed.map((img: any) => ({
						id: img.id || '',
						uri: img.uri || img.url || '',
					}));
				}
				return [
					{
						id: parsed.id || '',
						uri: parsed.uri || parsed.url || '',
					},
				];
			} catch (error) {
				console.warn('Error parsing images JSON string:', error);
				return [{ id: '', uri: images }];
			}
		}

		return [];
	}
}

export const userSearchProvider = new UserSearchProvider();
