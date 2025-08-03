import { useSession } from '@/context/authContext';
import { WishlistProviderInterface } from '@/interfaces/WishlistProviderInterface';
import { wishlistProvider } from '@/domain/WishlistProvider';
import useToast from '@/hooks/ui/useToast';
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
		WishlistProviderInterface.addToWishlist(
			sneakerId,
			wishlistProvider.addToWishlist
		)
			.then(() => {
				showSuccessToast(
					t('social.wishlist.messages.added.title'),
					t('social.wishlist.messages.added.description')
				);
				return refreshUserData();
			})
			.catch((error) => {
				showErrorToast(
					t('social.wishlist.messages.error.title'),
					t('social.wishlist.messages.error.description')
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
		WishlistProviderInterface.removeFromWishlist(
			sneakerId,
			wishlistProvider.removeFromWishlist
		)
			.then(() => {
				showSuccessToast(
					t('social.wishlist.messages.removed.title'),
					t('social.wishlist.messages.removed.description')
				);
				return refreshUserData();
			})
			.catch((error) => {
				showErrorToast(
					t('social.wishlist.messages.error.title'),
					t('social.wishlist.messages.error.description')
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
		WishlistProviderInterface.isInWishlist(
			sneakerId,
			wishlistProvider.isInWishlist
		)
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
