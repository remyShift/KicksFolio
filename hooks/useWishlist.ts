import { useSession } from '@/context/authContext';
import { SupabaseWishlistService } from '@/services/WishlistService';
import useToast from './useToast';

const useWishlist = () => {
	const { showSuccessToast, showErrorToast } = useToast();
	const { refreshUserData } = useSession();

	const addToWishList = async (
		sneakerId: string,
		setIsWishlisted: (isWishlisted: boolean) => void,
		setIsLoading: (isLoading: boolean) => void
	) => {
		SupabaseWishlistService.addToWishlist(sneakerId)
			.then(() => {
				showSuccessToast(
					'❤️ Sneaker added to your wishlist',
					'You can see it in your wishlist page'
				);
				return refreshUserData();
			})
			.catch((error) => {
				showErrorToast(
					'❌ Error updating wishlist status',
					'Please try again later'
				);
				console.error('Error updating wishlist status:', error);
				setIsWishlisted(true);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const removeFromWishList = async (
		sneakerId: string,
		setIsWishlisted: (isWishlisted: boolean) => void,
		setIsLoading: (isLoading: boolean) => void
	) => {
		SupabaseWishlistService.removeFromWishlist(sneakerId)
			.then(() => {
				showSuccessToast(
					'💔 Sneaker removed from your wishlist',
					"Let's find other one !"
				);
				return refreshUserData();
			})
			.catch((error) => {
				showErrorToast(
					'❌ Error updating wishlist status',
					'Please try again later'
				);
				console.error('Error updating wishlist status:', error);
				setIsWishlisted(false);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const checkWishlistStatus = async (
		sneakerId: string,
		setIsWishlisted: (isWishlisted: boolean) => void
	) => {
		SupabaseWishlistService.isInWishlist(sneakerId)
			.then((isInWishlist) => {
				setIsWishlisted(isInWishlist);
			})
			.catch((error) => {
				console.error('Error checking wishlist status:', error);
			});
	};

	return {
		addToWishList,
		removeFromWishList,
		checkWishlistStatus,
	};
};

export default useWishlist;
