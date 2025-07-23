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

		const offset = page * this.PAGE_SIZE;

		const { data, error } = await supabase.rpc('search_users', {
			search_term: searchTerm.trim(),
			current_user_id: currentUserId,
			page_offset: offset,
			page_limit: this.PAGE_SIZE + 1, // Get one extra to check if there are more
		});

		if (error) {
			console.error('Error searching users:', error);
			throw error;
		}

		const users = data || [];
		const hasMore = users.length > this.PAGE_SIZE;
		const actualUsers = hasMore ? users.slice(0, this.PAGE_SIZE) : users;

		return {
			users: actualUsers.map((user: any) => ({
				...user,
				followers_count: Number(user.followers_count),
				following_count: Number(user.following_count),
			})),
			hasMore,
			totalCount: actualUsers.length,
		};
	}

	static async getUserProfile(
		userId: string,
		currentUserId: string
	): Promise<SearchUser | null> {
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
			console.error('Error fetching user profile:', error);
			return null;
		}

		// Get additional info using our DB functions
		const [followersResult, followingResult, isFollowingResult] =
			await Promise.all([
				supabase.rpc('get_followers_count', { user_uuid: userId }),
				supabase.rpc('get_following_count', { user_uuid: userId }),
				supabase.rpc('is_following', {
					follower_uuid: currentUserId,
					following_uuid: userId,
				}),
			]);

		return {
			...user,
			followers_count: Number(followersResult.data || 0),
			following_count: Number(followingResult.data || 0),
			is_following: Boolean(isFollowingResult.data || false),
		};
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
			console.error('Error fetching user sneakers:', error);
			throw error;
		}

		return (data || []).map((sneaker) => ({
			...sneaker,
			images: this.parseImages(sneaker.images),
		}));
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
