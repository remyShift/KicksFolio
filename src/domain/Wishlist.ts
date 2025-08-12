import { Sneaker } from '@/types/sneaker';
import { WishlistItem } from '@/types/wishlist';

export interface WishlistInterface {
	addToWishlist: (sneakerId: string) => Promise<WishlistItem>;
	removeFromWishlist: (sneakerId: string) => Promise<void>;
	isInWishlist: (sneakerId: string) => Promise<boolean>;
	getUserWishlistSneakers: (userId: string) => Promise<Sneaker[]>;
	getWishlistsForSneaker: (sneakerId: string) => Promise<any[]>;
}

export class Wishlist {
	constructor(private readonly wishlist: WishlistInterface) {}

	addToWishlist = async (sneakerId: string) => {
		return this.wishlist
			.addToWishlist(sneakerId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ Wishlist.addToWishlist: Error occurred:',
					error
				);
				throw error;
			});
	};

	removeFromWishlist = async (sneakerId: string) => {
		return this.wishlist
			.removeFromWishlist(sneakerId)
			.then(() => {
				return;
			})
			.catch((error) => {
				console.error(
					'❌ Wishlist.removeFromWishlist: Error occurred:',
					error
				);
				throw error;
			});
	};

	isInWishlist = async (sneakerId: string) => {
		return this.wishlist
			.isInWishlist(sneakerId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ Wishlist.isInWishlist: Error occurred:',
					error
				);
				throw error;
			});
	};

	getUserWishlistSneakers = async (userId: string) => {
		return this.wishlist
			.getUserWishlistSneakers(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ Wishlist.getUserWishlistSneakers: Error occurred:',
					error
				);
				throw error;
			});
	};

	getWishlistsForSneaker = async (sneakerId: string) => {
		return this.wishlist
			.getWishlistsForSneaker(sneakerId)
			.then((wishlists) => {
				return wishlists;
			})
			.catch((error) => {
				console.error(
					'❌ Wishlist.getWishlistsForSneaker: Error occurred:',
					error
				);
				throw error;
			});
	};
}
