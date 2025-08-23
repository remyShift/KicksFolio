import { supabase } from '@/config/supabase/supabase';
import { WishlistInterface } from '@/domain/Wishlist';
import { DbWishlistWithSneaker } from '@/types/database';
import { Sneaker } from '@/types/sneaker';
import { mapDbWishlistToSneaker } from '@/utils/mappers';

export class WishlistProxy implements WishlistInterface {
	async add(sneakerId: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data: existing } = await supabase
			.from('wishlists')
			.select('id')
			.eq('user_id', user.id)
			.eq('sneaker_id', sneakerId)
			.single();

		if (existing) {
			return {
				id: existing.id,
				user_id: user.id,
				sneaker_id: sneakerId,
				created_at: new Date().toISOString(),
			};
		}

		const { data, error } = await supabase
			.from('wishlists')
			.insert([
				{
					user_id: user.id,
					sneaker_id: sneakerId,
				},
			])
			.select()
			.single();

		if (error) throw error;
		if (!data) throw new Error('Failed to add to wishlist');

		return {
			id: data.id,
			user_id: data.user_id,
			sneaker_id: data.sneaker_id,
			created_at: data.created_at,
		};
	}

	async remove(sneakerId: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { error } = await supabase
			.from('wishlists')
			.delete()
			.eq('user_id', user.id)
			.eq('sneaker_id', sneakerId);

		if (error) throw error;
	}

	async contains(sneakerId: string): Promise<boolean> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('wishlists')
			.select('id')
			.eq('user_id', user.id)
			.eq('sneaker_id', sneakerId)
			.single();

		if (error && error.code !== 'PGRST116') throw error;
		return !!data;
	}

	async getByUserId(userId: string): Promise<Sneaker[]> {
		const { data: wishlistData, error: wishlistError } = await supabase
			.from('wishlists')
			.select('id, created_at, sneaker_id')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (wishlistError) {
			console.error(
				'❌ WishlistProxy.getByUserId - wishlist error:',
				wishlistError
			);
			throw wishlistError;
		}

		if (!wishlistData || wishlistData.length === 0) {
			return [];
		}

		const sneakerIds = wishlistData.map((item) => item.sneaker_id);

		const { data: sneakersData, error: sneakersError } = await supabase
			.from('sneakers')
			.select(
				`
				id, 
				brand_id, 
				model, 
				gender, 
				sku, 
				description, 
				image,
				brands (
					id,
					name
				)
			`
			)
			.in('id', sneakerIds);

		if (sneakersError) {
			console.error(
				'❌ WishlistProxy.getByUserId - sneakers error:',
				sneakersError
			);
			throw sneakersError;
		}

		const sneakersMap = new Map();
		sneakersData?.forEach((sneaker) => {
			sneakersMap.set(sneaker.id, sneaker);
		});

		const dbWishlistItems: DbWishlistWithSneaker[] = wishlistData
			.map((wishlistItem) => ({
				...wishlistItem,
				user_id: userId,
				sneakers: sneakersMap.get(wishlistItem.sneaker_id),
			}))
			.filter((item) => item.sneakers);

		if (!dbWishlistItems) return [];

		const result = dbWishlistItems
			.map(mapDbWishlistToSneaker)
			.filter((sneaker): sneaker is Sneaker => sneaker !== null);

		return result;
	}

	async getBySneakerId(sneakerId: string) {
		const { data, error } = await supabase
			.from('wishlists')
			.select(
				`
				id,
				created_at,
				user_id,
				users!inner (
					id,
					username,
					first_name,
					last_name,
					profile_picture
				)
			`
			)
			.eq('sneaker_id', sneakerId);

		if (error) throw error;
		return data || [];
	}
}

export const wishlistProxy = new WishlistProxy();
