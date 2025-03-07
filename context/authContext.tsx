import { createContext, useContext, type PropsWithChildren, useState, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { authApi } from '@/services/authApi';
import { storageService } from '@/services/storage';
import { useAppState } from '@react-native-community/hooks';
import { useStorageState } from '@/hooks/useStorageState';
import { router } from 'expo-router';
import { User, Sneaker, Collection, ProfileData } from '@/types/Models';

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
        if (storedUser) setUser(storedUser);
        
        const storedCollection = await storageService.getItem('collection');
        if (storedCollection) setUserCollection(storedCollection);
        
        const storedSneakers = await storageService.getItem('sneakers');
        if (storedSneakers) setUserSneakers(storedSneakers);
        
        if (sessionToken) {
            const isValid = await verifyToken();
            if (!isValid) await logout();
        }
    };

    const login = async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        setSessionToken(data.token);
        setUser(data.user);
        await storageService.setItem('user', data.user);
    }

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
            throw new Error(`Error when signing up: ${error}`);
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
        await storageService.setItem('user', null);
        await storageService.setItem('collection', null);
        await storageService.setItem('sneakers', null);
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
