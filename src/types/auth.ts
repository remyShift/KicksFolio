import { Dispatch, SetStateAction } from 'react';

import { Sneaker } from '@/types/sneaker';
import { FollowingUser, User } from '@/types/user';

export interface FollowingUserWithSneakers extends FollowingUser {
	sneakers: Sneaker[];
}

export interface AuthContextType {
	isLoading: boolean;
	userSneakers: Sneaker[] | null;
	setUserSneakers: Dispatch<SetStateAction<Sneaker[] | null>>;
	user: User | null;
	setUser: Dispatch<SetStateAction<User | null>>;
	refreshUserData: () => Promise<void>;
	refreshUserSneakers: () => Promise<void>;
	clearUserData: () => void;
	wishlistSneakers: Sneaker[] | null;
	resetTokens: { access_token: string; refresh_token: string } | null;
	followingUsers: FollowingUserWithSneakers[] | null;
	setFollowingUsers: Dispatch<
		SetStateAction<FollowingUserWithSneakers[] | null>
	>;
	refreshFollowingUsers: () => Promise<void>;
	unreadNotificationCount: number;
	refreshNotifications: () => Promise<void>;
}

export interface UserData {
	email: string;
	password: string;
	confirmPassword: string;
	username: string;
	first_name: string;
	last_name: string;
	sneaker_size: number;
	profile_picture?: string;
}

export interface UpdateUserData {
	username?: string;
	first_name?: string;
	last_name?: string;
	sneaker_size?: number;
	profile_picture?: string;
	email?: string;
	instagram_username?: string;
	social_media_visibility?: boolean;
}

export interface OAuthUserData {
	email: string;
	first_name?: string;
	last_name?: string;
	profile_picture?: string;
	provider: 'google' | 'apple';
}

export interface OAuthCompletionData {
	username: string;
	first_name: string;
	last_name: string;
	sneaker_size: number;
	profile_picture?: string;
}
