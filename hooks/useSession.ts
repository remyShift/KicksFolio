import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSession = () => {
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    useEffect(() => {
        const loadSession = () => {
            AsyncStorage.getItem('sessionToken')
                .then((token) => {
                    setSessionToken(token);
                })
                .catch((error) => {
                    console.error('Error loading session:', error);
                });
        };

        loadSession();
    }, []);
    const updateSession = (token: string | null) => {
        if (token) {
            AsyncStorage.setItem('sessionToken', token)
                .then(() => {
                    setSessionToken(token);
                })
                .catch((error) => {
                    console.error('Error updating session:', error);
                });
        } else {
            AsyncStorage.removeItem('sessionToken')
                .then(() => {
                    setSessionToken(null);
                })
                .catch((error) => {
                    console.error('Error updating session:', error);
                });
        }
    };

    return {
        sessionToken,
        updateSession
    };
}; 