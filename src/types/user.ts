import { Sneaker } from './sneaker';

export type User = {
	id: string;
	email: string;
	password: string;
	username: string;
	sneaker_size: number;
	created_at: string;
	updated_at: string;
	followers: User[];
	sneakers: Sneaker[];
	profile_picture: string;
	instagram_username?: string;
	social_media_visibility?: boolean;
	followers_count?: number;
	following_count?: number;
	is_anonymous?: boolean;
	linked_oauth_accounts?: Array<{
		provider: 'google' | 'apple';
		provider_account_id: string;
	}>;
};

export interface SearchUser {
	id: string;
	username: string;
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

export interface UserInfo {
	id: string;
	email: string;
	username: string;
	sneaker_size: number;
	profile_picture?: string;
	created_at: string;
	updated_at: string;
	instagram_username?: string;
	social_media_visibility?: boolean;
}

export interface FollowingUser extends SearchUser {
	followed_at: string;
}
