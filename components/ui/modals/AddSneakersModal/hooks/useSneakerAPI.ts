import { useState } from 'react';
import { SneakerFormData } from '../types';

export const useSneakerAPI = (sessionToken: string | null) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSkuSneakerData = async (sku: string) => {
        if (!sessionToken) throw new Error('No session token');
        
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/sneakers/sku/${sku}`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sneaker data');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSneakerSubmit = async (formData: SneakerFormData, sneakerId: string | null) => {
        if (!sessionToken) throw new Error('No session token');
        
        setIsLoading(true);
        setError(null);

        try {
            const url = sneakerId 
                ? `${process.env.EXPO_PUBLIC_BASE_API_URL}/sneakers/${sneakerId}`
                : `${process.env.EXPO_PUBLIC_BASE_API_URL}/sneakers`;

            const response = await fetch(url, {
                method: sneakerId ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit sneaker data');
            }

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSneakerDelete = async (sneakerId: string, userId: string) => {
        if (!sessionToken) throw new Error('No session token');
        
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/sneakers/${sneakerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete sneaker');
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        fetchSkuSneakerData,
        handleSneakerSubmit,
        handleSneakerDelete,
    };
};
