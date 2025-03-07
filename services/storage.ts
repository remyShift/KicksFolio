import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Collection, Sneaker } from '@/types/Models';
import { setStorageItemAsync } from '@/hooks/useStorageState';

export const storageService = {
    setItem: async (key: string, value: any): Promise<void> => {
        return (key === 'sessionToken' 
            ? setStorageItemAsync(key, JSON.stringify(value))
            : AsyncStorage.setItem(key, JSON.stringify(value))
        ).then(() => {
            return;
        }).catch(error => {
            console.error(`Error storing ${key}:`, error);
            throw error;
        });
    },

    getItem: async (key: string): Promise<any> => {
        return AsyncStorage.getItem(key).then(value => {
            return value ? JSON.parse(value) : null;
        }).catch(error => {
            console.error(`Error retrieving ${key}:`, error);
            throw error;
        });
    },

    removeItem: async (key: string): Promise<void> => {
        return AsyncStorage.removeItem(key).catch(error => {
            console.error(`Error removing ${key}:`, error);
            throw error;
        });
    },

    setSessionData: async (token: string, userData: User) => {
        return Promise.all([
            setStorageItemAsync('sessionToken', token),
            AsyncStorage.setItem('user', JSON.stringify(userData))
        ]).catch(error => {
            console.error('Error storing session data:', error);
            throw error;
        });
    },

    clearSessionData: async () => {
        return Promise.all([
            setStorageItemAsync('sessionToken', null),
            AsyncStorage.removeItem('user'),
            AsyncStorage.removeItem('collection'), 
            AsyncStorage.removeItem('sneakers')
        ]).catch(error => {
            console.error('Error clearing session data:', error);
            throw error;
        });
    },

    setUserData: async (user: User) => {
        return AsyncStorage.setItem('user', JSON.stringify(user))
            .catch(error => {
                console.error('Error storing user data:', error);
                throw error;
            });
    },

    getUserData: async (): Promise<User | null> => {
        return AsyncStorage.getItem('user').then(userData => {
            return userData ? JSON.parse(userData) : null;
        }).catch(error => {
            console.error('Error retrieving user data:', error);
            throw error;
        });
    },

    setCollectionData: async (collection: Collection) => {
        return AsyncStorage.setItem('collection', JSON.stringify(collection))
            .catch(error => {
                console.error('Error storing collection data:', error);
                throw error;
            });
    },

    getCollectionData: async (): Promise<Collection | null> => {
        return AsyncStorage.getItem('collection').then(collectionData => {
            return collectionData ? JSON.parse(collectionData) : null;
        }).catch(error => {
            console.error('Error retrieving collection data:', error);
            throw error;
        });
    },

    setSneakersData: async (sneakers: Sneaker[]) => {
        return AsyncStorage.setItem('sneakers', JSON.stringify(sneakers))
            .catch(error => {
                console.error('Error storing sneakers data:', error);
                throw error;
            });
    },

    getSneakersData: async (): Promise<Sneaker[] | null> => {
        return AsyncStorage.getItem('sneakers').then(sneakersData => {
            return sneakersData ? JSON.parse(sneakersData) : null;
        }).catch(error => {
            console.error('Error retrieving sneakers data:', error);
            throw error;
        });
    },

    initializeStorageData: async (): Promise<{
        user: User | null;
        collection: Collection | null;
        sneakers: Sneaker[] | null;
    }> => {
        return Promise.all([
            AsyncStorage.getItem('user'),
            AsyncStorage.getItem('collection'),
            AsyncStorage.getItem('sneakers')
        ]).then(([userData, collectionData, sneakersData]) => {
            return {
                user: userData ? JSON.parse(userData) : null,
                collection: collectionData ? JSON.parse(collectionData) : null,
                sneakers: sneakersData ? JSON.parse(sneakersData) : null
            };
        }).catch(error => {
            console.error('Error initializing storage data:', error);
            throw error;
        });
    },

    saveAppState: async (data: {
        user: User | null;
        collection: Collection | null;
        sneakers: Sneaker[] | null;
    }) => {
        const promises = [];
            
        if (data.user) {
            promises.push(AsyncStorage.setItem('user', JSON.stringify(data.user)));
        }
        if (data.collection) {
            promises.push(AsyncStorage.setItem('collection', JSON.stringify(data.collection)));
        }
        if (data.sneakers) {
            promises.push(AsyncStorage.setItem('sneakers', JSON.stringify(data.sneakers)));
        }

        return Promise.all(promises).catch(error => {
            console.error('Error saving app state:', error);
            throw error;
        });
    }
};