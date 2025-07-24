import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType, FollowingUserWithSneakers } from '@/types/auth';
import { storageService } from '@/services/StorageService';
import { useAppState } from '@react-native-community/hooks';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';
import { SupabaseAuthService } from '@/services/AuthService';

import { SupabaseSneakerService } from '@/services/SneakersService';
import { SupabaseWishlistService } from '@/services/WishlistService';
import { FollowerService, FollowingUser } from '@/services/FollowerService';
import { UserSearchService } from '@/services/UserSearchService';
import { supabase } from '@/services/supabase';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

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
    const [resetTokens, setResetTokens] = useState<{access_token: string, refresh_token: string} | null>(null);

    const [user, setUser] = useState<User | null>(null);
    const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);
    const [wishlistSneakers, setWishlistSneakers] = useState<Sneaker[] | null>(null);
    const [followingUsers, setFollowingUsers] = useState<FollowingUserWithSneakers[] | null>(null);

    useEffect(() => {
        const handleDeepLink = (url: string) => {
            if (url.includes('reset-password')) {
                const fragmentPart = url.split('#')[1];
                
                if (fragmentPart) {
                    const params = new URLSearchParams(fragmentPart);

                    const error = params.get('error');
                    const errorCode = params.get('error_code');
                    
                    if (error) {                        
                        if (errorCode === 'otp_expired') {
                            router.replace({
                                pathname: '/login',
                                params: {
                                    error: 'reset_link_expired',
                                }
                            });
                            
                        } else {
                            router.replace({
                                pathname: '/login',
                                params: {
                                    error: 'reset_link_invalid',
                                }
                            });
                        }
                        return;
                    }
                    
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        setResetTokens({ access_token: accessToken, refresh_token: refreshToken });
                    } else {
                        router.replace({
                            pathname: '/login',
                            params: {
                                error: 'reset_link_invalid',
                            }
                        });
                    }
                } else {
                    router.replace({
                        pathname: '/login',
                        params: {
                            error: 'reset_link_invalid',
                        }
                    });
                }
            }
        };

        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink(url);
            }
        });

        const linkingListener = Linking.addEventListener('url', (event) => {
            handleDeepLink(event.url);
        });

        return () => {
            linkingListener.remove();
        };
    }, []);

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

    const loadFollowingUsers = async (userId: string) => {
        return FollowerService.getFollowingUsers(userId)
            .then(async (followingUsersData) => {
                // Enrichir avec les sneakers de chaque utilisateur suivi
                const followingWithSneakers = await Promise.all(
                    followingUsersData.map(async (followingUser) => {
                        try {
                            const sneakers = await UserSearchService.getUserSneakers(followingUser.id);
                            return {
                                ...followingUser,
                                sneakers: sneakers || []
                            };
                        } catch (error) {
                            console.warn(`Error loading sneakers for user ${followingUser.id}:`, error);
                            return {
                                ...followingUser,
                                sneakers: []
                            };
                        }
                    })
                );

                setFollowingUsers(followingWithSneakers);
                storageService.setItem('followingUsers', followingWithSneakers);
                
                return followingWithSneakers;
            })
            .catch((error) => {
                console.error('Error loading following users:', error);
                setFollowingUsers([]);
                storageService.setItem('followingUsers', []);
                return [];
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
                        
                        // Charger les sneakers et les following users en parallèle
                        return Promise.all([
                            loadUserSneakers(userWithUrl),
                            loadFollowingUsers(userWithUrl.id)
                        ]);
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
                
                // Rafraîchir les sneakers et les following users en parallèle
                return Promise.all([
                    loadUserSneakers(userWithUrl),
                    loadFollowingUsers(userWithUrl.id)
                ]);
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

    const refreshFollowingUsers = async () => {
        if (!user?.id) {
            setFollowingUsers([]);
            storageService.setItem('followingUsers', []);
            return;
        }
        
        return loadFollowingUsers(user.id);
    };

    const clearUserData = () => {
        setUser(null);
        setUserSneakers(null);
        setWishlistSneakers(null);
        setFollowingUsers(null);
        setResetTokens(null);

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
                wishlistSneakers,
                resetTokens,
                followingUsers,
                setFollowingUsers,
                refreshFollowingUsers
            }}>
			{children}
		</AuthContext.Provider>
	);
}
