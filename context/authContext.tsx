import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { storageService } from '@/services/StorageService';
import { useAppState } from '@react-native-community/hooks';
import { User } from '@/types/User';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';
import { SupabaseAuthService } from '@/services/AuthService';
import { SupabaseCollectionService } from '@/services/CollectionService';
import { SupabaseSneakerService } from '@/services/SneakersService';
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
    const [userCollection, setUserCollection] = useState<Collection | null>(null);
    const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);

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
                        return refreshUserData(userWithUrl as User);
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

    const refreshUserData = async (currentUser?: User) => {
        const userData = currentUser || user;
        
        if (!userData) return;

        const userWithUrl = { ...userData, profile_picture_url: userData.profile_picture };
        SupabaseCollectionService.getUserCollections(userWithUrl.id)
            .then(async (collections) => {
                const collection = collections?.[0] || null;

                setUserCollection(collection);
                userWithUrl.collection = collection;
                setUser(userWithUrl);

                storageService.setItem('collection', collection);
                
                if (collection?.id) {
                    return await SupabaseSneakerService.getSneakersByCollection(collection.id)
                        .then(async (sneakers) => {
                            setUserSneakers(sneakers || []);
                            userWithUrl.sneakers = sneakers;
                            setUser(userWithUrl);

                            storageService.setItem('sneakers', sneakers || []);
                        });
                } else {
                    setUserSneakers([]);
                    userWithUrl.sneakers = [];
                    setUser(userWithUrl);
                    storageService.setItem('sneakers', []);
                    return Promise.resolve();
                }
            })
            .catch((error) => {
                console.error('Error refreshing user data:', error);
                setUserSneakers([]);
                storageService.setItem('sneakers', []);
            });
    };

    const refreshUserSneakers = async () => {
        if (!user || !userCollection?.id) {
            setUserSneakers([]);
            storageService.setItem('sneakers', []);
            return;
        }
        
        try {
            const sneakers = await SupabaseSneakerService.getSneakersByCollection(userCollection.id);
            setUserSneakers(sneakers || []);
            storageService.setItem('sneakers', sneakers || []);
        } catch (error) {
            console.error('Error refreshing sneakers:', error);
            setUserSneakers([]);
            storageService.setItem('sneakers', []);
        }
    };

    const clearUserData = () => {
        setUser(null);
        setUserCollection(null);
        setUserSneakers(null);

        storageService.clearSessionData();
    };

    const handleAppStateChange = async () => {
        if (appState === 'background') {
            await storageService.saveAppState({
                user,
                collection: userCollection,
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
                userCollection,
                setUserCollection,
                userSneakers,
                setUserSneakers,
                refreshUserData,
                refreshUserSneakers,
                clearUserData
            }}>
			{children}
		</AuthContext.Provider>
	);
}
