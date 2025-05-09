import { useState } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { HandleSneakers } from '@/services/SneakersService';

export const useSneakerAPI = (sessionToken: string | null) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSneakerSubmit = (sneaker: Sneaker, sneakerId: string | null) => {
        if (!sessionToken) return Promise.reject('No session token');

        setIsLoading(true);
        const sneakerService = new HandleSneakers(sneaker.collection_id, sessionToken);

        return sneakerService.add(sneaker, sneakerId || undefined)
            .then(response => {
                setIsLoading(false);
                return response;
            })
            .catch(error => {
                setIsLoading(false);
                throw error;
            });
    };

    const handleSneakerDelete = async (sneakerId: string, collectionId: string) => {
        if (!sessionToken) return Promise.reject('No session token');

        setIsLoading(true);
        const sneakerService = new HandleSneakers(collectionId, sessionToken);

        return sneakerService.delete(sneakerId)
            .then(response => {
                setIsLoading(false);
                return response;
            })
            .catch(error => {
                setIsLoading(false);
                throw error;
            });
    };

    const handleSkuLookup = async (sku: string) => {
        if (!sessionToken) return Promise.reject('No session token');

        setIsLoading(true);
        const sneakerService = new HandleSneakers('', sessionToken);

        return sneakerService.searchBySku(sku)
            .then(response => {
                setIsLoading(false);
                return response;
            })
            .catch(error => {
                setIsLoading(false);
                throw error;
            });
    };

    return {
        handleSneakerSubmit,
        handleSneakerDelete,
        handleSkuLookup,
        isLoading
    };
};
