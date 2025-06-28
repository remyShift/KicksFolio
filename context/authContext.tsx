import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { storageService } from '@/services/StorageService';
import { useAppState } from '@react-native-community/hooks';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';
import { SupabaseAuthService } from '@/services/AuthService';

import { SupabaseSneakerService } from '@/services/SneakersService';
import { SupabaseWishlistService } from '@/services/WishlistService';
import { supabase } from '@/services/supabase';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }
    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const appState = useAppState();
    const [isLoading, setIsLoading] = useState(true);

    const [user, setUser] = useState<User | null>(null);
    const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);
    const [wishlistSneakers, setWishlistSneakers] = useState<Sneaker[] | null>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {                
                if (session?.user) {
                    await initializeUserData(session.user.id);
                } else {
                    clearUserData();
                }
                
                setIsLoading(false);
            }
        );

        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                try {
                    await SupabaseAuthService.getCurrentUser();
                } catch (error: any) {
                    if (error.code === 'PGRST116') {
                        await supabase.auth.signOut();
                        clearUserData();
                    }
                }
            }
        };
        checkInitialSession();

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        handleAppStateChange();
    }, [appState]);

    const loadUserSneakers = async (userWithUrl: User) => {
        const sneakersPromise = SupabaseSneakerService.getSneakersByUser(userWithUrl.id);
        const wishlistPromise = SupabaseWishlistService.getUserWishlistSneakers(userWithUrl.id);
        
        return Promise.all([sneakersPromise, wishlistPromise])
            .then(([sneakers, wishlistSneakers]) => {
                setUserSneakers(sneakers || []);
                setWishlistSneakers(wishlistSneakers || []);
                
                storageService.setItem('sneakers', sneakers || []);
                storageService.setItem('wishlistSneakers', wishlistSneakers || []);
                
                userWithUrl.sneakers = sneakers;
                setUser(userWithUrl);
                storageService.setItem('user', userWithUrl);
            })
            .catch((error) => {
                console.error('Error loading user sneakers:', error);
                setUserSneakers([]);
                setWishlistSneakers([]);
                storageService.setItem('sneakers', []);
                storageService.setItem('wishlistSneakers', []);
            });
    };

    const initializeUserData = async (userId: string) => {
        const maxRetries = 3;
        const retryDelay = 1000;

        const getUserWithRetries = async (attempt: number): Promise<any> => {
            return SupabaseAuthService.getCurrentUser()
                .then((userData) => {
                    if (userData) {
                        const userWithUrl = { ...userData, profile_picture_url: userData.profile_picture };
                        setUser(userWithUrl as User);
                        storageService.setItem('user', userWithUrl);
                        
                        return loadUserSneakers(userWithUrl);
                    } else if (attempt < maxRetries) {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(getUserWithRetries(attempt + 1));
                            }, retryDelay);
                        });
                    } else {
                        throw new Error('User not found after multiple attempts');
                    }
                })
                .catch((error) => {
                    if (attempt < maxRetries && error.code === 'PGRST116') {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(getUserWithRetries(attempt + 1));
                            }, retryDelay);
                        });
                    } else {
                        throw error;
                    }
                });
        };

        getUserWithRetries(0)
            .catch((error) => {
                console.error('Error initializing user data:', error);
                clearUserData();
            });
    };

    const refreshUserData = async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ refreshUserData: Error getting session:', sessionError);
            return;
        }
        
        if (!session?.user) {
            console.log('ℹ️ refreshUserData: No valid session found, skipping data refresh');
            return;
        }

        return SupabaseAuthService.getCurrentUser()
            .then((freshUserData) => {
                if (!freshUserData) {
                    return;
                }

                const userWithUrl = { ...freshUserData, profile_picture_url: freshUserData.profile_picture };
                
                return loadUserSneakers(userWithUrl);
            })
            .catch((error) => {
                console.error('❌ refreshUserData: Error refreshing user data:', error);
                setUserSneakers([]);
                setWishlistSneakers([]);
                storageService.setItem('sneakers', []);
                storageService.setItem('wishlistSneakers', []);
            });
    };

    const refreshUserSneakers = async () => {
        if (!user?.id) {
            setUserSneakers([]);
            setWishlistSneakers([]);
            storageService.setItem('sneakers', []);
            storageService.setItem('wishlistSneakers', []);
            return;
        }
        
        const sneakersPromise = SupabaseSneakerService.getSneakersByUser(user.id);
        const wishlistPromise = SupabaseWishlistService.getUserWishlistSneakers(user.id);
        
        return Promise.all([sneakersPromise, wishlistPromise])
            .then(([sneakers, wishlistSneakers]) => {
                setUserSneakers(sneakers || []);
                setWishlistSneakers(wishlistSneakers || []);
                
                storageService.setItem('sneakers', sneakers || []);
                storageService.setItem('wishlistSneakers', wishlistSneakers || []);
            })
            .catch((error) => {
                console.error('Error refreshing sneakers:', error);
                setUserSneakers([]);
                setWishlistSneakers([]);
                storageService.setItem('sneakers', []);
                storageService.setItem('wishlistSneakers', []);
            });
    };

    const clearUserData = () => {
        setUser(null);
        setUserSneakers(null);
        setWishlistSneakers(null);

        storageService.clearSessionData();
    };

    const handleAppStateChange = async () => {
        if (appState === 'background') {
            await storageService.saveAppState({
                user,
                sneakers: userSneakers
            });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                user,
                setUser,
                userSneakers,
                setUserSneakers,
                refreshUserData,
                refreshUserSneakers,
                clearUserData,
                wishlistSneakers
            }}>
			{children}
		</AuthContext.Provider>
	);
}
