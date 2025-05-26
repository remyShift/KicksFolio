import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/Auth';
import { storageService } from '@/services/StorageService';
import { useAppState } from '@react-native-community/hooks';
import { useStorageState } from '@/hooks/useStorageState';
import { User } from '@/types/User';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';

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
        const storedUser = await storageService.getItem('user');
        if (storedUser) setUser(storedUser as User);
        const storedCollection = await storageService.getItem('collection');
        if (storedCollection) setUserCollection(storedCollection as Collection);
        const storedSneakers = await storageService.getItem('sneakers');
        if (storedSneakers) setUserSneakers(storedSneakers as Sneaker[]);
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
