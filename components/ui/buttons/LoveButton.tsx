import { Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState, useEffect } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { useSession } from '@/context/authContext';
import { SupabaseWishlistService } from '@/services/WishlistService';
import useToast from '@/hooks/useToast';

export default function LoveButton({ sneaker }: { sneaker: Sneaker }) {
    const primary = '#F27329';
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { refreshUserData } = useSession();
    const { showSuccessToast, showErrorToast } = useToast();

    useEffect(() => {
        // Vérifier si la sneaker est dans la wishlist au chargement
        const checkWishlistStatus = async () => {
            try {
                const isInWishlist = await SupabaseWishlistService.isInWishlist(sneaker.id);
                setIsWishlisted(isInWishlist);
            } catch (error) {
                console.error('Error checking wishlist status:', error);
            }
        };

        checkWishlistStatus();
    }, [sneaker.id]);

    const handlePress = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        const newWishlistStatus = !isWishlisted;
        
        // Mise à jour optimiste de l'UI
        setIsWishlisted(newWishlistStatus);
        
        try {
            if (newWishlistStatus) {
                await SupabaseWishlistService.addToWishlist(sneaker.id);
                showSuccessToast('❤️ Sneaker added to your wishlist', 'You can see it in your wishlist page');
            } else {
                await SupabaseWishlistService.removeFromWishlist(sneaker.id);
                showSuccessToast('💔 Sneaker removed from your wishlist', 'Let\'s find other one !');
            }
            
            // Rafraîchir les données utilisateur pour mettre à jour la wishlist
            await refreshUserData();
        } catch (error) {
            showErrorToast('❌ Error updating wishlist status', 'Please try again later');
            console.error('Error updating wishlist status:', error);
            // Rétablir l'état précédent en cas d'erreur
            setIsWishlisted(!newWishlistStatus);
        } finally {
            setIsLoading(false);
        }
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