import { Dispatch, SetStateAction } from 'react';

import { FollowingUser } from '@/domain/FollowerProvider';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';

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
