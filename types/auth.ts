import { User } from './User';
import { Collection } from './Collection';
import { Sneaker } from './Sneaker';
import { ProfileData } from './ProfileData';
import { Dispatch, SetStateAction } from 'react';

export interface AuthContextType {
    sessionToken: string | null;
    isLoading: boolean;
    userCollection: Collection | null;
    userSneakers: Sneaker[] | null;
    user: User | null;
    setUserSneakers: Dispatch<SetStateAction<Sneaker[] | null>>;
    getUser: () => Promise<User | null>;
    getUserCollection: () => Promise<Collection | null>;
    getUserSneakers: () => Promise<Sneaker[] | null>;
    verifyToken: () => Promise<boolean>;
    loadInitialData: () => Promise<void>;
    updateUser: (user: User, profileData: ProfileData, sessionToken: string) => Promise<{ user: User }>;
    deleteAccount: (userId: string, token: string) => Promise<any>;
    logout: () => Promise<void>;
}

export interface UserData {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
    sneaker_size: number;
    profile_picture?: string;
}