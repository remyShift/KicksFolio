import { User } from './User';
import { Collection } from './Collection';
import { Sneaker } from './Sneaker';
import { Dispatch, SetStateAction } from 'react';

export interface AuthContextType {
	sessionToken: string | null;
	isLoading: boolean;
	userCollection: Collection | null;
	setUserCollection: Dispatch<SetStateAction<Collection | null>>;
	userSneakers: Sneaker[] | null;
	setUserSneakers: Dispatch<SetStateAction<Sneaker[] | null>>;
	user: User | null;
	setUser: Dispatch<SetStateAction<User | null>>;
	setSessionToken: Dispatch<SetStateAction<string | null>>;
	refreshUserData: (currentUser?: User, token?: string) => Promise<void>;
	refreshUserSneakers: () => Promise<void>;
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
