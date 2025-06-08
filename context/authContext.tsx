import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { storageService } from '@/services/StorageService';
import { useAppState } from '@react-native-community/hooks';
import { useStorageState } from '@/hooks/useStorageState';
import { User } from '@/types/User';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';
import { authService } from '@/services/AuthService';
import { collectionService } from '@/services/CollectionService';
import { SneakersService } from '@/services/SneakersService';

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
    const [[isLoading, sessionToken], setSessionToken] = useStorageState('sessionToken');
    const [user, setUser] = useState<User | null>(null);
    const [userCollection, setUserCollection] = useState<Collection | null>(null);
    const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);

    useEffect(() => {
        initializeData();
    }, [sessionToken]);

    useEffect(() => {
        handleAppStateChange();
    }, [appState]);

    const initializeData = async () => {
        if (sessionToken) {
            try {
                const { user: userData } = await authService.getUser(sessionToken);
                setUser(userData);
                storageService.setItem('user', userData);
                
                // Récupérer la collection et les sneakers en parallèle
                await refreshUserData(userData, sessionToken);
            } catch (error) {
                console.error('Error initializing user data:', error);
                clearUserData();
            }
        } else {
            clearUserData();
        }
    };

    const refreshUserData = async (currentUser?: User, token?: string) => {
        const userData = currentUser || user;
        const sessionTokenToUse = token || sessionToken;
        
        if (!userData || !sessionTokenToUse) return;

        try {
            // Récupérer collection et sneakers en parallèle
            const [collectionResponse, sneakersData] = await Promise.all([
                collectionService.getUserCollection(userData.id, sessionTokenToUse),
                new SneakersService(userData.id, sessionTokenToUse).getUserSneakers()
            ]);

            setUserCollection(collectionResponse.collection);
            setUserSneakers(sneakersData.sneakers || []);
            
            // Sauvegarder en cache
            storageService.setItem('collection', collectionResponse.collection);
            storageService.setItem('sneakers', sneakersData.sneakers || []);
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const refreshUserSneakers = async () => {
        if (!user || !sessionToken) return;
        
        try {
            const sneakersService = new SneakersService(user.id, sessionToken);
            const data = await sneakersService.getUserSneakers();
            setUserSneakers(data.sneakers || []);
            storageService.setItem('sneakers', data.sneakers || []);
        } catch (error) {
            console.error('Error refreshing sneakers:', error);
        }
    };

    const clearUserData = () => {
        setUser(null);
        setUserCollection(null);
        setUserSneakers(null);
        // Nettoyer le cache
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
                setSessionToken: (value) => {
                    if (typeof value === 'function') {
                        setSessionToken((value as (prev: string | null) => string | null)(null));
                    } else {
                        setSessionToken(value);
                    }
                }
            }}>
            {children}
        </AuthContext.Provider>
    );
}
