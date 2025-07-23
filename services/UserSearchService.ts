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
		console.log('🔍 [UserSearchService] searchUsers started (Direct SQL)', {
			searchTerm,
			currentUserId,
			page,
		});

		if (searchTerm.trim().length < 2) {
			console.log(
				'⚠️ [UserSearchService] Search term too short, returning empty'
			);
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
		console.log('🔧 [UserSearchService] Using direct SQL search fallback');

		const offset = page * this.PAGE_SIZE;
		const searchPattern = `%${searchTerm.trim().toLowerCase()}%`;

		// Search users by username, first_name, or last_name
		console.log('📡 [UserSearchService] Executing SQL search query...');
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
			.neq('id', currentUserId) // Exclude current user
			.range(offset, offset + this.PAGE_SIZE); // Get one extra to check if there are more

		console.log('📊 [UserSearchService] SQL query result:', {
			found: !!users,
			count: users?.length || 0,
			error: error?.message,
		});

		if (error) {
			console.error(
				'❌ [UserSearchService] Direct SQL search failed:',
				error
			);
			throw error;
		}

		const usersList = users || [];
		const hasMore = usersList.length > this.PAGE_SIZE;
		const actualUsers = hasMore
			? usersList.slice(0, this.PAGE_SIZE)
			: usersList;

		// Get additional data for each user (followers count, etc.)
		console.log(
			'📊 [UserSearchService] Enriching users with follower data...'
		);
		const enrichedUsers = await Promise.all(
			actualUsers.map(async (user: any) => {
				try {
					// Get followers count
					const { count: followersCount, error: followersError } =
						await supabase
							.from('followers')
							.select('*', { count: 'exact', head: true })
							.eq('following_id', user.id);

					// Get following count
					const { count: followingCount, error: followingError } =
						await supabase
							.from('followers')
							.select('*', { count: 'exact', head: true })
							.eq('follower_id', user.id);

					// Check if current user is following this user
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
					// Return user with default values if enrichment fails
					return {
						...user,
						followers_count: 0,
						following_count: 0,
						is_following: false,
					};
				}
			})
		);

		console.log('✅ [UserSearchService] Direct SQL search completed');

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
		console.log('🔍 [UserSearchService] getUserProfile started', {
			userId,
			currentUserId,
		});

		try {
			console.log('📡 [UserSearchService] Fetching user data...');
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

			console.log('👤 [UserSearchService] User data result:', {
				found: !!user,
				error: error?.message,
				userData: user
					? { id: user.id, username: user.username }
					: null,
			});

			if (error || !user) {
				console.error(
					'❌ [UserSearchService] Error fetching user profile:',
					error
				);
				return null;
			}

			console.log('📊 [UserSearchService] Fetching followers count...');
			// Get followers count using direct SQL query
			const { count: followersCount, error: followersError } =
				await supabase
					.from('followers')
					.select('*', { count: 'exact', head: true })
					.eq('following_id', userId);

			console.log('👥 [UserSearchService] Followers count result:', {
				count: followersCount,
				error: followersError?.message,
			});

			console.log('📊 [UserSearchService] Fetching following count...');
			// Get following count using direct SQL query
			const { count: followingCount, error: followingError } =
				await supabase
					.from('followers')
					.select('*', { count: 'exact', head: true })
					.eq('follower_id', userId);

			console.log('👤 [UserSearchService] Following count result:', {
				count: followingCount,
				error: followingError?.message,
			});

			console.log(
				'🔗 [UserSearchService] Checking if current user is following...'
			);
			// Check if current user is following this user
			const { data: isFollowingData, error: isFollowingError } =
				await supabase
					.from('followers')
					.select('id')
					.eq('follower_id', currentUserId)
					.eq('following_id', userId)
					.single();

			console.log('❤️ [UserSearchService] Is following result:', {
				found: !!isFollowingData,
				error: isFollowingError?.message,
			});

			// Handle errors gracefully - if counts fail, default to 0
			const finalFollowersCount = followersError
				? 0
				: followersCount || 0;
			const finalFollowingCount = followingError
				? 0
				: followingCount || 0;
			const isFollowing = !isFollowingError && !!isFollowingData;

			console.log('📋 [UserSearchService] Final counts calculated:', {
				followersCount: finalFollowersCount,
				followingCount: finalFollowingCount,
				isFollowing,
			});

			const result = {
				...user,
				followers_count: finalFollowersCount,
				following_count: finalFollowingCount,
				is_following: isFollowing,
			};

			console.log(
				'✅ [UserSearchService] getUserProfile completed successfully'
			);
			return result;
		} catch (error) {
			console.error(
				'❌ [UserSearchService] Error in getUserProfile:',
				error
			);
			return null;
		}
	}

	static async getUserSneakers(
		userId: string,
		page: number = 0
	): Promise<any[]> {
		console.log('👟 [UserSearchService] getUserSneakers started', {
			userId,
			page,
		});

		const offset = page * this.PAGE_SIZE;

		console.log('📡 [UserSearchService] Fetching sneakers data...');
		const { data, error } = await supabase
			.from('sneakers')
			.select('*')
			.eq('user_id', userId)
			.eq('wishlist', false)
			.order('created_at', { ascending: false })
			.range(offset, offset + this.PAGE_SIZE - 1);

		console.log('👟 [UserSearchService] Sneakers data result:', {
			found: !!data,
			count: data?.length || 0,
			error: error?.message,
		});

		if (error) {
			console.error(
				'❌ [UserSearchService] Error fetching user sneakers:',
				error
			);
			throw error;
		}

		const result = (data || []).map((sneaker) => ({
			...sneaker,
			images: this.parseImages(sneaker.images),
		}));

		console.log(
			'✅ [UserSearchService] getUserSneakers completed successfully'
		);
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
