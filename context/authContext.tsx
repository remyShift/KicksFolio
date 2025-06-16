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
        // Écouter les changements d'état d'authentification Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);
                
                if (session?.user) {
                    // Utilisateur connecté
                    setSessionTokenState(session.access_token);
                    await initializeUserData(session.user.id);
                } else {
                    // Utilisateur déconnecté
                    clearUserData();
                }
                
                setIsLoading(false);
            }
        );

        // Nettoyage
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        handleAppStateChange();
    }, [appState]);

    const initializeUserData = async (userId: string) => {
        try {
            // Récupérer les données utilisateur depuis Supabase
            const userData = await SupabaseAuthService.getCurrentUser();
            if (userData) {
                setUser(userData);
                storageService.setItem('user', userData);
                await refreshUserData(userData);
            }
        } catch (error) {
            console.error('Error initializing user data:', error);
            clearUserData();
        }
    };

    const refreshUserData = async (currentUser?: User) => {
        const userData = currentUser || user;
        
        if (!userData) return;

        try {
            // Récupérer les collections depuis Supabase
            const collections = await SupabaseCollectionService.getUserCollections(userData.id);
            const collection = collections?.[0] || null; // Prendre la première collection
            
            setUserCollection(collection);
            storageService.setItem('collection', collection);
            
            if (collection?.id) {
                // Récupérer les sneakers depuis Supabase
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

    // Fonction pour compatibilité avec l'ancienne interface
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
