import { useSession } from '@/context/authContext';
import { SupabaseWishlistService } from '@/services/WishlistService';
import useToast from '../../../../hooks/useToast';
import { useTranslation } from 'react-i18next';

const useWishlist = () => {
	const { showSuccessToast, showErrorToast } = useToast();
	const { refreshUserData } = useSession();
	const { t } = useTranslation();
	const addToWishList = async (
		sneakerId: string,
		setIsWishlisted: (isWishlisted: boolean) => void,
		setIsLoading: (isLoading: boolean) => void
	) => {
		SupabaseWishlistService.addToWishlist(sneakerId)
			.then(() => {
				showSuccessToast(
					t('common.titles.sneakerAddedToWishlist'),
					t('common.descriptions.sneakerAddedToWishlist')
				);
				return refreshUserData();
			})
			.catch((error) => {
				showErrorToast(
					t('common.titles.errorUpdatingWishlistStatus'),
					t('common.descriptions.errorUpdatingWishlistStatus')
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
					t('common.titles.sneakerRemovedFromWishlist'),
					t('common.descriptions.sneakerRemovedFromWishlist')
				);
				return refreshUserData();
			})
			.catch((error) => {
				showErrorToast(
					t('common.titles.errorUpdatingWishlistStatus'),
					t('common.descriptions.errorUpdatingWishlistStatus')
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
