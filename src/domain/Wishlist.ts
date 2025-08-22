import { Sneaker } from '@/types/sneaker';
import { WishlistItem } from '@/types/wishlist';

export interface WishlistInterface {
	add: (collectionId: string) => Promise<WishlistItem>;
	remove: (collectionId: string) => Promise<void>;
	contains: (collectionId: string) => Promise<boolean>;
	getByUserId: (userId: string) => Promise<Sneaker[]>;
	getBySneakerId: (sneakerId: string) => Promise<any[]>;
}

export class Wishlist {
	constructor(private readonly wishlistProxy: WishlistInterface) {}

	add = async (collectionId: string) => {
		return this.wishlistProxy
			.add(collectionId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error('❌ Wishlist.add: Error occurred:', error);
				throw error;
			});
	};

	remove = async (collectionId: string) => {
		return this.wishlistProxy
			.remove(collectionId)
			.then(() => {
				return;
			})
			.catch((error) => {
				console.error('❌ Wishlist.remove: Error occurred:', error);
				throw error;
			});
	};

	contains = async (collectionId: string) => {
		return this.wishlistProxy
			.contains(collectionId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error('❌ Wishlist.contains: Error occurred:', error);
				throw error;
			});
	};

	getByUserId = async (userId: string) => {
		return this.wishlistProxy
			.getByUserId(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ Wishlist.getByUserId: Error occurred:',
					error
				);
				throw error;
			});
	};

	getBySneakerId = async (sneakerId: string) => {
		return this.wishlistProxy
			.getBySneakerId(sneakerId)
			.then((wishlists) => {
				return wishlists;
			})
			.catch((error) => {
				console.error(
					'❌ Wishlist.getBySneakerId: Error occurred:',
					error
				);
				throw error;
			});
	};
}
