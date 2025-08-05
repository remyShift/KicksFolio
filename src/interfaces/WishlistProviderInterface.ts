import { WishlistItem } from '@/src/domain/WishlistProvider';
import { Sneaker } from '@/types/sneaker';

export interface WishlistProviderInterface {
	addToWishlist: (sneakerId: string) => Promise<WishlistItem>;
	removeFromWishlist: (sneakerId: string) => Promise<void>;
	isInWishlist: (sneakerId: string) => Promise<boolean>;
	getUserWishlistSneakers: (userId: string) => Promise<Sneaker[]>;
	getWishlistsForSneaker: (sneakerId: string) => Promise<any[]>;
}

export class WishlistProviderInterface {
	static addToWishlist = async (
		sneakerId: string,
		addToWishlistFunction: WishlistProviderInterface['addToWishlist']
	) => {
		return addToWishlistFunction(sneakerId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ WishlistProviderInterface.addToWishlist: Error occurred:',
					error
				);
				throw error;
			});
	};

	static removeFromWishlist = async (
		sneakerId: string,
		removeFromWishlistFunction: WishlistProviderInterface['removeFromWishlist']
	) => {
		return removeFromWishlistFunction(sneakerId)
			.then(() => {
				return;
			})
			.catch((error) => {
				console.error(
					'❌ WishlistProviderInterface.removeFromWishlist: Error occurred:',
					error
				);
				throw error;
			});
	};

	static isInWishlist = async (
		sneakerId: string,
		isInWishlistFunction: WishlistProviderInterface['isInWishlist']
	) => {
		return isInWishlistFunction(sneakerId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ WishlistProviderInterface.isInWishlist: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getUserWishlistSneakers = async (
		userId: string,
		getUserWishlistSneakersFunction: WishlistProviderInterface['getUserWishlistSneakers']
	) => {
		return getUserWishlistSneakersFunction(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ WishlistProviderInterface.getUserWishlistSneakers: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getWishlistsForSneaker = async (
		sneakerId: string,
		getWishlistsForSneakerFunction: WishlistProviderInterface['getWishlistsForSneaker']
	) => {
		return getWishlistsForSneakerFunction(sneakerId)
			.then((wishlists) => {
				return wishlists;
			})
			.catch((error) => {
				console.error(
					'❌ WishlistProviderInterface.getWishlistsForSneaker: Error occurred:',
					error
				);
				throw error;
			});
	};
}
