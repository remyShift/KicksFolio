import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { authService, UserData } from '@/services/AuthService';
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

    const login = async (email: string, password: string) => {
        const data = await authService.login(email, password);
        setSessionToken(data.tokens.access);
        setUser(data.user);
        await storageService.setItem('user', data.user);
    }

    const signUp = async (email: string, password: string, username: string, first_name: string, last_name: string, sneaker_size: number, profile_picture: string): Promise<void> => {
        const userData: UserData = {
            email,
            password,
            username,
            first_name,
            last_name,
            sneaker_size,
            profile_picture
        };

        return authService.signUp(userData)
            .then(data => {
                if (!data) {
                    throw new Error('Error when creating account');
                }
                setUser(data.user);
                return;
            })
            .catch(error => {
                throw new Error(`Error when signing up: ${error}`);
            });
    };

    const logout = async () => {
        if (sessionToken) {
            await authService.logout(sessionToken);
        }
        setSessionToken(null);
        await storageService.setItem('user', null);
        await storageService.setItem('collection', null);
        await storageService.setItem('sneakers', null);
        setUser(null);
        setUserCollection(null);
        setUserSneakers(null);
    };

    const getUser = async () => {
        if (!sessionToken) return;

        return authService.getUser(sessionToken)
            .then(async data => {
                setUser(data.user);
                await storageService.setItem('user', data.user);
                await getUserCollection();
                await getUserSneakers();
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

        return authService.verifyToken(sessionToken)
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

        const userData: Partial<UserData> = {
            username: profileData.newUsername,
            first_name: profileData.newFirstName,
            last_name: profileData.newLastName,
            sneaker_size: profileData.newSneakerSize,
            profile_picture: profileData.newProfilePicture
        };

        return authService.updateUser(user.id, userData, sessionToken)
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
        return authService.deleteAccount(userId, token)
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
                login,
                signUp,
                logout,
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
                deleteAccount
            }}>
            {children}
        </AuthContext.Provider>
    );
}
