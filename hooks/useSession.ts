import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSession = () => {
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const token = await AsyncStorage.getItem('sessionToken');
                setSessionToken(token);
            } catch (error) {
                console.error('Error loading session:', error);
            }
        };

        loadSession();
    }, []);

    const updateSession = async (token: string | null) => {
        try {
            if (token) {
                await AsyncStorage.setItem('sessionToken', token);
            } else {
                await AsyncStorage.removeItem('sessionToken');
            }
            setSessionToken(token);
        } catch (error) {
            console.error('Error updating session:', error);
        }
    };

    return {
        sessionToken,
        updateSession
    };
}; 