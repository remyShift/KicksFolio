import { supabase } from '@/config/supabase/supabase';
import { WishlistInterface } from '@/domain/Wishlist';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

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
		const { data, error } = await supabase
			.from('wishlists')
			.select(
				`
				id,
				created_at,
				sneakers!inner (
					id,
					brand,
					model,
					gender,
					sku,
					description
				)
			`
			)
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		if (!data) return [];

		return data
			.map(WishlistProxy.transformWishlistToSneaker)
			.filter((sneaker): sneaker is Sneaker => sneaker !== null);
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

	private static transformWishlistToSneaker(
		wishlistItem: Record<string, any>
	): Sneaker | null {
		try {
			const sneaker = wishlistItem?.sneakers;

			if (!sneaker?.id) {
				console.warn('🔍 WishlistProxy: Missing sneaker data:', {
					sneaker: !!sneaker?.id,
				});
				return null;
			}

			const transformedSneaker = {
				id: String(sneaker.id),
				model: String(sneaker.model || ''),
				brand: sneaker.brand as SneakerBrand,
				description: sneaker.description || '',
				sku: String(sneaker.sku || ''),
				gender: String(sneaker.gender || ''),
				wishlist_added_at: String(wishlistItem.created_at),
				user_id: '',
				size_eu: 0,
				size_us: 0,
				condition: 0,
				status: 'rocking' as SneakerStatus,
				price_paid: 0,
				estimated_value: 0,
				images: [],
				og_box: false,
				ds: false,
			};

			return transformedSneaker;
		} catch (error) {
			console.error(
				'❌ WishlistProxy: Error transforming wishlist item:',
				error
			);
			return null;
		}
	}
}

export const wishlistProxy = new WishlistProxy();
