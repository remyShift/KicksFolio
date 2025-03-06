import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { User, Collection, Sneaker, ProfileData } from '@/types/Models';
import { useAppState } from '@react-native-community/hooks';
import { useStorageState, setStorageItemAsync } from '@/hooks/useStorageState';
import { router } from 'expo-router';

const AuthContext = createContext<{
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, first_name: string, last_name: string, sneaker_size: number, profile_picture: string) => Promise<void>;
    logout: () => void;
    sessionToken?: string | null;
    isLoading: boolean;
    user?: User | null;
    userCollection?: Collection | null;
    userSneakers: Sneaker[] | null;
    setUserSneakers: React.Dispatch<React.SetStateAction<Sneaker[] | null>>;
    getUser: () => Promise<void | undefined>;
    getUserCollection: () => Promise<void | undefined>;
    getUserSneakers: () => Promise<void | undefined>;
    verifyToken: () => Promise<boolean>;
    loadInitialData: () => Promise<void | [void, void, void]>;
    updateUser: (user: User, profileData: ProfileData, sessionToken: string) => Promise<{ user: User }>;
    deleteAccount: (userId: string, token: string) => Promise<{ message: string }>;
    }>({
        login: async () => {},
        signUp: async () => {},
        logout: () => {},
        sessionToken: null,
        isLoading: false,
        user: null,
        userCollection: null,
        userSneakers: null,
        setUserSneakers: () => {},
        getUser: async () => {},
        getUserCollection: async () => {},
        getUserSneakers: async () => {},
        verifyToken: async () => false,
        loadInitialData: async () => {},
        updateUser: async () => ({ user: {} as User }),
        deleteAccount: async () => ({ message: '' })
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
    const [user, setUser] = useState<User | null>(null);
    const [userCollection, setUserCollection] = useState<Collection | null>(null);
    const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('user')
            .then(storedUser => {
                if (storedUser) setUser(JSON.parse(storedUser));
                return AsyncStorage.getItem('collection');
            })
            .then(storedCollection => {
                if (storedCollection) setUserCollection(JSON.parse(storedCollection));
                return AsyncStorage.getItem('sneakers');
            })
            .then(storedSneakers => {
                if (storedSneakers) setUserSneakers(JSON.parse(storedSneakers));
                if (sessionToken) {
                    return verifyToken();
                }
            })
            .then(isValid => {
                if (isValid === false) {
                    return logout();
                }
            })
            .catch(() => {
                return;
            });
    }, [sessionToken]);

    useEffect(() => {
        if (appState === 'active' && sessionToken) {
            loadInitialData();
        }

        if (appState === 'background') {
            if (user) storeData('user', user);
            if (userCollection) storeData('collection', userCollection);
            if (userSneakers) storeData('sneakers', userSneakers);
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
                return logout();
            });
    }, [sessionToken]);

    const storeData = (key: string, value: any) => {
        return new Promise((resolve, reject) => {
            if (key === 'sessionToken') {
                setStorageItemAsync(key, JSON.stringify(value))
                    .then(() => resolve(value))
                    .catch(() => reject(value));
            } else {
                AsyncStorage.setItem(key, JSON.stringify(value))
                    .then(() => resolve(value))
                    .catch(() => reject(value));
            }
        });
    };

    const login = async (email: string, password: string) => {
        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ authentication: { email, password } }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error logging in');
            }
            return response.json();
        })
        .then(data => {
            const { token, user: userData } = data;
            
            return Promise.all([
                setStorageItemAsync('sessionToken', token),
                AsyncStorage.setItem('user', JSON.stringify(userData))
            ])
            .then(() => {
                setSessionToken(token);
                setUser(userData);
                return data;
            });
        })
        .catch(error => {
            throw error;
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
                throw new Error(errorMessage);
            }

            return data;
        })
        .catch(error => {
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
        storeData('user', null);
        storeData('collection', null);
        storeData('sneakers', null);
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
            setUser(data.user);
            await storeData('user', data.user);
            await getUserCollection();
            await getUserSneakers();
        })
        .catch(async error => {
            await logout();
            throw error;
        });
    };

    const getUserCollection = async () => {
        if (!user?.id || !sessionToken) return Promise.resolve(null);
        
        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${user.id}/collection`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401) {
                return logout().then(() => null);
            }

            if (!response.ok) {
                throw new Error('Error when getting collection');
            }

            return response.json();
        })
        .then(data => {
            if (data && data.collection) {
                setUserCollection(data.collection);
                storeData('collection', data.collection);
                return data.collection;
            }
            return null;
        })
        .catch(error => {
            setUserCollection(null);
            storeData('collection', null);
            throw error;
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
        .then(data => {
            if (data && data.sneakers) {
                setUserSneakers(data.sneakers);
                storeData('sneakers', data.sneakers);
                return data.sneakers;
            }
            return null;
        })
        .catch(error => {
            setUserSneakers(null);
            storeData('sneakers', null);
            return null;
        });
    };

    const verifyToken = async () => {
        if (!sessionToken) return Promise.resolve(false);

        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/verify_token`, {
            method: 'POST', 
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    return logout().then(() => false);
                }
                return false;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.valid) {
                return getUser().then(() => true);
            }
            return false;
        })
        .catch(() => {
            return false;
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
            .catch(() => {
                return null;
            });
    };

    const updateUser = async (user: User, profileData: ProfileData, sessionToken: string): Promise<{ user: User }> => {
        if (!user?.id) {
            return { user: {} as User };
        }
    
        const formData = new FormData();
        
        if (profileData.newUsername !== user.username) {
            formData.append('user[username]', profileData.newUsername);
        }
        if (profileData.newFirstName !== user.first_name) {
            formData.append('user[first_name]', profileData.newFirstName);
        }
        if (profileData.newLastName !== user.last_name) {
            formData.append('user[last_name]', profileData.newLastName);
        }
        if (profileData.newSneakerSize !== user.sneaker_size) {
            formData.append('user[sneaker_size]', profileData.newSneakerSize.toString());
        }
    
        if (profileData.newProfilePicture && profileData.newProfilePicture !== user.profile_picture?.url) {
            const imageUriParts = profileData.newProfilePicture.split('.');
            const fileType = imageUriParts[imageUriParts.length - 1];
            
            const imageFile = {
                uri: profileData.newProfilePicture,
                type: 'image/jpeg',
                name: `profile_picture.${fileType}`
            };
    
            formData.append('user[profile_picture]', imageFile as any);
        }
    
        return fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${user.id}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: formData
        })
        .then(async response => {
            const text = await response.text();
            const data = JSON.parse(text);
            
            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Error when updating profile';
                throw new Error(errorMessage);
            }
            return data;
        })
        .then((data) => {
            getUser()
                .then(() => router.replace('/(app)/(tabs)/user'));
            return data;
        })
        .catch(error => {
            throw error;
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
        .then(async response => {
            if (!response.ok) {
                throw new Error('Error when deleting account');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            throw error;
        });
    }

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
