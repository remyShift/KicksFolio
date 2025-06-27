import { Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState, useEffect } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { useSession } from '@/context/authContext';
import { SupabaseSneakerService } from '@/services/SneakersService';

export default function LoveButton({ sneaker }: { sneaker: Sneaker }) {
    const primary = '#F27329';
    const [isWishlisted, setIsWishlisted] = useState(sneaker.wishlist || false);
    const [isLoading, setIsLoading] = useState(false);
    const { refreshUserData } = useSession();

    useEffect(() => {
        setIsWishlisted(sneaker.wishlist || false);
    }, [sneaker.wishlist]);

    const handlePress = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        const newWishlistStatus = !isWishlisted;
        
        // Optimistic update
        setIsWishlisted(newWishlistStatus);
        
        SupabaseSneakerService.updateWishlistStatus(sneaker.id, newWishlistStatus)
            .then(() => {
                // Refresh data to sync all components
                return refreshUserData();
            })
            .catch((error) => {
                console.error('Error updating wishlist status:', error);
                // Revert optimistic update on error
                setIsWishlisted(!newWishlistStatus);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Pressable
            className="bg-white p-3 rounded-md flex items-center justify-center"
            onPress={handlePress}
            disabled={isLoading}
        >
            {isWishlisted ? 
                <AntDesign name="heart" size={20} color={primary} /> : 
                <AntDesign name="hearto" size={20} color="black" />
            }
        </Pressable>
    );
}