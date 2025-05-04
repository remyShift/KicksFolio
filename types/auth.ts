import { User } from '@/types/User';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';
import { ProfileData } from '@/types/ProfileData';

export interface AuthContextType {
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, first_name: string, last_name: string, sneaker_size: number, profile_picture: string) => Promise<void>;
    logout: () => void;
    sessionToken?: string | null;
    isLoading: boolean;
    user?: User | null;
    userCollection?: Collection | null;
    userSneakers: Sneaker[] | null;
    setUserSneakers: React.Dispatch<React.SetStateAction<Sneaker[] | null>>;
    getUser: () => Promise<void>;
    getUserCollection: () => Promise<void>;
    getUserSneakers: () => Promise<void>;
    verifyToken: () => Promise<boolean>;
    loadInitialData: () => Promise<void>;
    updateUser: (user: User, profileData: ProfileData, sessionToken: string) => Promise<{ user: User }>;
    deleteAccount: (userId: string, token: string) => Promise<{ message: string }>;
} 