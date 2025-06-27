import { Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState, useEffect } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { useSession } from '@/context/authContext';
import { SupabaseSneakerService } from '@/services/SneakersService';
import useToast from '@/hooks/useToast';

export default function LoveButton({ sneaker }: { sneaker: Sneaker }) {
    const primary = '#F27329';
    const [isWishlisted, setIsWishlisted] = useState(sneaker.wishlist || false);
    const [isLoading, setIsLoading] = useState(false);
    const { refreshUserData } = useSession();
    const { showSuccessToast, showErrorToast } = useToast();

    useEffect(() => {
        setIsWishlisted(sneaker.wishlist || false);
    }, [sneaker.wishlist]);

    const handlePress = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        const newWishlistStatus = !isWishlisted;
        
        setIsWishlisted(newWishlistStatus);
        
        SupabaseSneakerService.updateWishlistStatus(sneaker.id, newWishlistStatus)
            .then(() => {
                if (newWishlistStatus) {
                    showSuccessToast('❤️ Sneaker added to your wishlist', 'You can see it in your wishlist page');
                } else {
                    showSuccessToast('💔 Sneaker removed from your wishlist', 'Let\'s find other one !');
                }
                return refreshUserData();
            })
            .catch((error) => {
                showErrorToast('❌ Error updating wishlist status', 'Please try again later');
                console.error('Error updating wishlist status:', error);
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