import { supabase } from './supabase';

export interface SearchUser {
	id: string;
	username: string;
	first_name: string;
	last_name: string;
	profile_picture?: string;
	is_following: boolean;
	followers_count: number;
	following_count: number;
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
				profile_picture
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
					const { count: followersCount, error: followersError } =
						await supabase
							.from('followers')
							.select('*', { count: 'exact', head: true })
							.eq('following_id', user.id);

					const { count: followingCount, error: followingError } =
						await supabase
							.from('followers')
							.select('*', { count: 'exact', head: true })
							.eq('follower_id', user.id);

					const { data: isFollowingData, error: isFollowingError } =
						await supabase
							.from('followers')
							.select('id')
							.eq('follower_id', currentUserId)
							.eq('following_id', user.id)
							.single();

					return {
						...user,
						followers_count: followersError
							? 0
							: Number(followersCount || 0),
						following_count: followingError
							? 0
							: Number(followingCount || 0),
						is_following: !isFollowingError && !!isFollowingData,
					};
				} catch (error) {
					console.warn(
						`⚠️ [UserSearchService] Error enriching user ${user.id}:`,
						error
					);
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
					instagram_username
				`
				)
				.eq('id', userId)
				.single();

			if (error || !user) {
				return null;
			}

			const { count: followersCount, error: followersError } =
				await supabase
					.from('followers')
					.select('*', { count: 'exact', head: true })
					.eq('following_id', userId);

			const { count: followingCount, error: followingError } =
				await supabase
					.from('followers')
					.select('*', { count: 'exact', head: true })
					.eq('follower_id', userId);

			const { data: isFollowingData, error: isFollowingError } =
				await supabase
					.from('followers')
					.select('id')
					.eq('follower_id', currentUserId)
					.eq('following_id', userId)
					.single();

			const finalFollowersCount = followersError
				? 0
				: followersCount || 0;
			const finalFollowingCount = followingError
				? 0
				: followingCount || 0;
			const isFollowing = !isFollowingError && !!isFollowingData;

			const result = {
				...user,
				followers_count: finalFollowersCount,
				following_count: finalFollowingCount,
				is_following: isFollowing,
			};

			return result;
		} catch (error) {
			return null;
		}
	}

	static async getUserSneakers(
		userId: string,
		page: number = 0
	): Promise<any[]> {
		const offset = page * this.PAGE_SIZE;

		const { data, error } = await supabase
			.from('sneakers')
			.select('*')
			.eq('user_id', userId)
			.eq('wishlist', false)
			.order('created_at', { ascending: false })
			.range(offset, offset + this.PAGE_SIZE - 1);

		if (error) {
			throw error;
		}

		const result = (data || []).map((sneaker) => ({
			...sneaker,
			images: this.parseImages(sneaker.images),
		}));

		return result;
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
				return [{ id: '', uri: images }];
			}
		}

		return [];
	}
}
