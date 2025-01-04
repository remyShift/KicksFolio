import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { User, Collection, Sneaker } from '@/types/Models';
import { useAppState } from '@react-native-community/hooks';
import { useStorageState, setStorageItemAsync } from '@/hooks/useStorageState';

const AuthContext = createContext<{
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, first_name: string, last_name: string, sneaker_size: number, profile_picture: string) => Promise<void>;
    logout: () => void;
    sessionToken?: string | null;
    isLoading: boolean;
    user?: User | null;
    userCollection?: Collection | null;
    userSneakers?: Sneaker[] | null;
    getUser: () => Promise<void | undefined>;
    getUserCollection: () => Promise<void | undefined>;
    getUserSneakers: () => Promise<void | undefined>;
    verifyToken: () => Promise<boolean>;
    isLoadingSneakers: boolean;
    loadInitialData: () => Promise<void | [void, void, void]>;
    }>({
        login: async () => {},
        signUp: async () => {},
        logout: () => {},
        sessionToken: null,
        isLoading: false,
        user: null,
        userCollection: null,
        userSneakers: null,
        getUser: async () => {},
        getUserCollection: async () => {},
        getUserSneakers: async () => {},
        verifyToken: async () => false,
        isLoadingSneakers: true,
        loadInitialData: async () => {}
});

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
    const [[, storedUser], setStoredUser] = useStorageState('user');
    const [[, storedCollection], setStoredCollection] = useStorageState('collection');
    const [[, storedSneakers], setStoredSneakers] = useStorageState('sneakers');
    
    const [user, setUser] = useState<User | null>(storedUser ? JSON.parse(storedUser) : null);
    const [userCollection, setUserCollection] = useState<Collection | null>(storedCollection ? JSON.parse(storedCollection) : null);
    const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(storedSneakers ? JSON.parse(storedSneakers) : null);
    const [isLoadingSneakers, setIsLoadingSneakers] = useState(true);

    useEffect(() => {
        const initializeFromStorage = async () => {
            if (storedUser && storedCollection && storedSneakers) {
                Promise.resolve()
                    .then(() => {
                        setUser(JSON.parse(storedUser));
                        setUserCollection(JSON.parse(storedCollection));
                        setUserSneakers(JSON.parse(storedSneakers));
                        setIsLoadingSneakers(false);
                    })
                    .catch(error => {
                        console.error('Error parsing stored data:', error);
                    });
            }
        };

        initializeFromStorage();
    }, []);

    useEffect(() => {
        if (appState === 'active' && sessionToken) {
            loadInitialData();
        }

        if (appState === 'background') {
            if (user) setStoredUser(JSON.stringify(user));
            if (userCollection) setStoredCollection(JSON.stringify(userCollection));
            if (userSneakers) setStoredSneakers(JSON.stringify(userSneakers));
        }
    }, [appState]);

    useEffect(() => {
        if (!sessionToken) {
            setUser(null);
            setUserCollection(null);
            setUserSneakers(null);
            return;
        }

        if (user && userCollection && userSneakers) {
            return;
        }

        verifyToken()
            .then(isValid => {
                if (!isValid) {
                    return logout();
                }
                return getUser();
            })
            .catch(error => {
                console.error('Error initializing session:', error);
                return logout();
            });
    }, [sessionToken]);

    const storeData = async (key: string, value: any) => {
        try {
            if (key === 'sessionToken') {
                await setStorageItemAsync(key, JSON.stringify(value));
            } else {
                await AsyncStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Error storing data:', error);
        }
    };
    
    const loadData = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedCollection = await AsyncStorage.getItem('collection');
            const storedSneakers = await AsyncStorage.getItem('sneakers');
    
            if (storedUser) setUser(JSON.parse(storedUser));
            if (storedCollection) setUserCollection(JSON.parse(storedCollection));
            if (storedSneakers) setUserSneakers(JSON.parse(storedSneakers));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const login = async (email: string, password: string) => {
        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error when logging in');
            }
            return response.json();
        })
        .then(async data => {
            const { token } = data;
            setSessionToken(token);
            await getUser();
        })
        .catch(error => {
            throw new Error('Invalid email or password');
        });
    };

    const signUp = async (email: string, password: string, username: string, first_name: string, last_name: string, sneaker_size: number, profile_picture: string): Promise<void> => {
        const formData = new FormData();
        formData.append('user[email]', email);
        formData.append('user[password]', password);
        formData.append('user[username]', username);
        formData.append('user[first_name]', first_name);
        formData.append('user[last_name]', last_name);
        formData.append('user[sneaker_size]', sneaker_size.toString());

        if (profile_picture) {
            const imageUriParts = profile_picture.split('.');
            const fileType = imageUriParts[imageUriParts.length - 1];
            
            const imageFile = {
                uri: profile_picture,
                type: 'image/jpeg',
                name: `profile_picture.${fileType}`
            };

            formData.append('user[profile_picture]', imageFile as any);
        }

        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData,
        })
        .then(async response => {
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Error when creating account';
                console.error('Error on server:', {
                    status: response.status,
                    data: data
                });
                throw new Error(errorMessage);
            }

            return data;
        })
        .catch(error => {
            console.error('Complete error:', error);
            throw error;
        });
    };

    const logout = async () => {
        await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/logout`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Accept': 'application/json'
            }
        });
        setSessionToken(null);
        setStoredUser(null);
        setStoredCollection(null);
        setStoredSneakers(null);
        setUser(null);
        setUserCollection(null);
        setUserSneakers(null);
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
                return;
            }

            if (!response.ok) {
                throw new Error('Error when getting user');
            }

            return response.json();
        })
        .then(async data => {
            await setUser(data.user);
            await setStoredUser(JSON.stringify(data.user));
            await getUserCollection();
            await getUserSneakers();
        })
        .catch(async error => {
            console.error('Complete get user error:', error);
            await logout();
            throw error;
        });
    };

    const getUserCollection = async () => {
        if (!user?.id || !sessionToken) return null;
        
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${user.id}/collection`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Accept': 'application/json'
                }
            });

            if (response.status === 401) {
                await logout();
                return null;
            }

            if (!response.ok) {
                throw new Error('Error when getting collection');
            }

            const data = await response.json();
            if (data && data.collection) {
                setUserCollection(data.collection);
                setStoredCollection(JSON.stringify(data.collection));
                return data.collection;
            }
            return null;
        } catch (error) {
            console.error('Error when getting collection:', error);
            setUserCollection(null);
            setStoredCollection(null);
            throw error;
        }
    };

    const getUserSneakers = async () => {
        if (!user?.id || !sessionToken) {
            setIsLoadingSneakers(false);
            return null;
        }

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${user.id}/collection/sneakers`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });

            if (!response.ok) return null;
            
            const data = await response.json();
            if (data && data.sneakers) {
                setUserSneakers(data.sneakers);
                setStoredSneakers(JSON.stringify(data.sneakers));
                return data.sneakers;
            }
            return null;
        } catch (error) {
            console.error('Error when getting sneakers:', error);
            setUserSneakers(null);
            setStoredSneakers(null);
            return null;
        } finally {
            setIsLoadingSneakers(false);
        }
    };

    const verifyToken = async () => {
        if (!sessionToken) return false;

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/verify_token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    await logout();
                }
                return false;
            }

            const data = await response.json();
            if (data && data.valid) {
                await getUser();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error when verifying token:', error);
            return false;
        }
    };

    const loadInitialData = async () => {
        if (!sessionToken || !user) return;
        
        setIsLoadingSneakers(true);

        try {
            const collection = await getUserCollection();
            if (collection) {
                const sneakers = await getUserSneakers();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setIsLoadingSneakers(false);
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
                getUser,
                getUserCollection,
                getUserSneakers,
                verifyToken,
                isLoadingSneakers,
                loadInitialData
            }}>
            {children}
        </AuthContext.Provider>
    );
}
