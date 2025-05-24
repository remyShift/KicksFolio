import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/Auth';
import { storageService } from '@/services/StorageService';
import { useAppState } from '@react-native-community/hooks';
import { useStorageState } from '@/hooks/useStorageState';
import { router } from 'expo-router';
import { User } from '@/types/User';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';
import { ProfileData } from '@/types/ProfileData';

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
        
        if (sessionToken) {
            const isValid = await verifyToken();
            if (!isValid) await logout();
        }
    };

    const getUser = async () => {
        if (!sessionToken) return;

        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Accept': 'application/json'
            }
        })
        .then(async response => {
            if (response.status === 401) {
                await logout();
                return null;
            }
            if (!response.ok) throw new Error('Error when getting user');
            return response.json();
        })
        .then(async data => {
            if (data?.user) {
                setUser(data.user);
                await storageService.setItem('user', data.user);
                await getUserCollection();
                await getUserSneakers();
                return data.user;
            }
            return null;
        })
        .catch(async error => {
            await logout();
            throw new Error(`Error when getting user: ${error}`);
        });
    };

    const getUserCollection = async () => {
        if (!user?.id || !sessionToken) return null;
        
        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${user.id}/collection`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Accept': 'application/json'
            }
        })
        .then(async response => {
            if (response.status === 401) {
                await logout();
                return null;
            }
            if (!response.ok) throw new Error('Error when getting collection');
            return response.json();
        })
        .then(async data => {
            if (data?.collection) {
                setUserCollection(data.collection);
                await storageService.setItem('collection', data.collection);
                return data.collection;
            }
            return null;
        })
        .catch(async error => {
            setUserCollection(null);
            await storageService.setItem('collection', null);
            throw new Error(`Error when getting collection: ${error}`);
        });
    };

    const getUserSneakers = async () => {
        if (!user?.id || !sessionToken) {
            return Promise.resolve(null);
        }

        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${user.id}/collection/sneakers`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        })
        .then(response => {
            if (!response.ok) return null;
            return response.json();
        })
        .then(async data => {
            if (data && data.sneakers) {
                setUserSneakers(data.sneakers);
                await storageService.setItem('sneakers', data.sneakers);
                return data.sneakers;
            }
            return null;
        })
        .catch(async error => {
            setUserSneakers(null);
            await storageService.setItem('sneakers', null);
            throw new Error(`Error when getting sneakers: ${error}`);
        });
    };

    const verifyToken = async () => {
        if (!sessionToken) return Promise.resolve(false);

        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) return false;
            return response.json();
        })
        .then(isValid => {
            if (isValid) {
                return getUser().then(() => true);
            }
            return false;
        })
        .catch((error) => {
            throw new Error(`Error when verifying token: ${error}`);
        });
    };

    const logout = async () => {
        if (sessionToken) {
            await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Accept': 'application/json'
                }
            });
        }
        setSessionToken(null);
        await storageService.setItem('user', null);
        await storageService.setItem('collection', null);
        await storageService.setItem('sneakers', null);
        setUser(null);
        setUserCollection(null);
        setUserSneakers(null);
    };

    const loadInitialData = async () => {
        if (!sessionToken || !user) return;
        
        await getUserCollection()
            .then(collection => {
                if (collection) {
                    return getUserSneakers();
                }
                return null;
            })
            .catch((error) => {
                throw new Error(`Error when loading initial data: ${error}`);
            });
    };

    const updateUser = async (user: User, profileData: ProfileData, sessionToken: string): Promise<{ user: User }> => {
        if (!user?.id) {
            return { user: {} as User };
        }

        const userData = {
            username: profileData.newUsername,
            first_name: profileData.newFirstName,
            last_name: profileData.newLastName,
            sneaker_size: profileData.newSneakerSize,
            profile_picture: profileData.newProfilePicture
        };

        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error when updating user');
            return response.json();
        })
        .then((data) => {
            getUser()
                .then(() => router.replace('/(app)/(tabs)/user'));
            return data;
        })
        .catch(error => {
            throw new Error(`Error when updating user: ${error}`);
        });
    }

    const deleteAccount = async (userId: string, token: string) => {
        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Error when deleting account');
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            throw new Error(`Error when deleting account: ${error}`);
        });
    }

    const handleAppStateChange = async () => {
        if (appState === 'active' && sessionToken) {
            await loadInitialData();
        }

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
                userCollection,
                userSneakers,
                user,
                setUserSneakers,
                getUser,
                getUserCollection,
                getUserSneakers,
                verifyToken,
                loadInitialData,
                updateUser,
                deleteAccount,
                logout
            }}>
            {children}
        </AuthContext.Provider>
    );
}
