import { Sneaker } from '@/types/sneaker';
import { WishlistItem } from '@/types/wishlist';

export interface WishlistInterface {
	add: (sneakerId: string) => Promise<WishlistItem>;
	remove: (sneakerId: string) => Promise<void>;
	contains: (sneakerId: string) => Promise<boolean>;
	getByUserId: (userId: string) => Promise<Sneaker[]>;
	getBySneakerId: (sneakerId: string) => Promise<any[]>;
}

export class Wishlist {
	constructor(private readonly wishlistProxy: WishlistInterface) {}

	add = async (sneakerId: string) => {
		return this.wishlistProxy
			.add(sneakerId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error('❌ Wishlist.add: Error occurred:', error);
				throw error;
			});
	};

	remove = async (sneakerId: string) => {
		return this.wishlistProxy
			.remove(sneakerId)
			.then(() => {
				return;
			})
			.catch((error) => {
				console.error('❌ Wishlist.remove: Error occurred:', error);
				throw error;
			});
	};

	contains = async (sneakerId: string) => {
		return this.wishlistProxy
			.contains(sneakerId)
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
