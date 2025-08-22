import { Wishlist } from '@/domain/Wishlist';
import { wishlistProxy } from '@/tech/proxy/WishlistProxy';

export const wishlist = new Wishlist(wishlistProxy);
