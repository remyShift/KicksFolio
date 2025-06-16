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
    const [sessionToken, setSessionTokenState] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userCollection, setUserCollection] = useState<Collection | null>(null);
    const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);
                
                if (session?.user) {
                    setSessionTokenState(session.access_token);
                    await initializeUserData(session.user.id);
                } else {
                    clearUserData();
                }
                
                setIsLoading(false);
            }
        );

        // Vérifier et nettoyer les sessions problématiques au démarrage
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Vérifier si l'utilisateur existe dans notre table
                try {
                    await SupabaseAuthService.getCurrentUser();
                } catch (error: any) {
                    if (error.code === 'PGRST116') {
                        console.log('Session utilisateur orpheline détectée, nettoyage...');
                        await supabase.auth.signOut();
                        clearUserData();
                    }
                }
            }
        };
        checkInitialSession();

        // Nettoyage
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
                        setUser(userData);
                        storageService.setItem('user', userData);
                        return refreshUserData(userData);
                    } else if (attempt < maxRetries) {
                        console.log(`User not found, retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
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
                        console.log(`Database error, retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
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

        try {
            const collections = await SupabaseCollectionService.getUserCollections(userData.id);
            const collection = collections?.[0] || null;
            
            setUserCollection(collection);
            storageService.setItem('collection', collection);
            
            if (collection?.id) {
                const sneakers = await SupabaseSneakerService.getSneakersByCollection(collection.id);
                setUserSneakers(sneakers || []);
                storageService.setItem('sneakers', sneakers || []);
            } else {
                setUserSneakers([]);
                storageService.setItem('sneakers', []);
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            setUserSneakers([]);
            storageService.setItem('sneakers', []);
        }
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
        setSessionTokenState(null);
        setUser(null);
        setUserCollection(null);
        setUserSneakers(null);

        storageService.removeItem('user');
        storageService.removeItem('collection');
        storageService.removeItem('sneakers');
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

    const setSessionToken = (value: string | null | ((prev: string | null) => string | null)) => {
        if (typeof value === 'function') {
            setSessionTokenState(value(sessionToken));
        } else {
            setSessionTokenState(value);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                sessionToken,
                isLoading,
                user,
                setUser,
                userCollection,
                setUserCollection,
                userSneakers,
                setUserSneakers,
                refreshUserData,
                refreshUserSneakers,
                setSessionToken
            }}>
			{children}
		</AuthContext.Provider>
	);
}
