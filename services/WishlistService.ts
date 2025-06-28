import { BaseApiService } from '@/services/BaseApiService';
import { supabase } from './supabase';
import { Sneaker, SneakerBrand, SneakerStatus, Photo } from '@/types/Sneaker';

export interface WishlistItem {
	id: string;
	user_id: string;
	sneaker_id: string;
	created_at: string;
}

export class SupabaseWishlistService extends BaseApiService {
	static async addToWishlist(sneakerId: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('wishlists')
			.insert([{ user_id: user.id, sneaker_id: sneakerId }])
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async removeFromWishlist(sneakerId: string) {
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

	static async isInWishlist(sneakerId: string): Promise<boolean> {
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

	static async getUserWishlistSneakers(userId: string): Promise<Sneaker[]> {
		const { data, error } = await supabase
			.from('wishlists')
			.select(
				`
				sneaker_id,
				created_at,
				sneakers!inner (
					*,
					users!inner (
						id,
						username,
						first_name,
						last_name,
						profile_picture
					)
				)
			`
			)
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		if (!data) return [];

		return data
			.map(SupabaseWishlistService.transformToSneaker)
			.filter((sneaker): sneaker is Sneaker => sneaker !== null);
	}

	static async getWishlistsForSneaker(sneakerId: string) {
		const { data, error } = await supabase
			.from('wishlists')
			.select(
				`
				*,
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

	private static transformToSneaker(
		item: Record<string, any>
	): Sneaker | null {
		try {
			const sneaker = item?.sneakers;
			const owner = sneaker?.users;

			if (!sneaker?.id || !owner?.id) {
				return null;
			}

			return {
				id: String(sneaker.id),
				model: String(sneaker.model || ''),
				price_paid: Number(sneaker.price_paid || 0),
				brand: sneaker.brand as SneakerBrand,
				size: Number(sneaker.size || 0),
				condition: Number(sneaker.condition || 0),
				status: sneaker.status as SneakerStatus,
				description: sneaker.description,
				user_id: String(sneaker.user_id),
				created_at: String(sneaker.created_at),
				updated_at: String(sneaker.updated_at),
				estimated_value: Number(sneaker.estimated_value || 0),
				images: SupabaseWishlistService.parseImages(sneaker.images),
				owner: {
					id: String(owner.id),
					username: String(owner.username || ''),
					first_name: String(owner.first_name || ''),
					last_name: String(owner.last_name || ''),
					profile_picture_url: String(owner.profile_picture || ''),
				},
				wishlist_added_at: String(item.created_at),
			};
		} catch (error) {
			console.error('Error transforming wishlist item:', error);
			return null;
		}
	}

	private static parseImages(images: unknown): Photo[] {
		if (!images) return [];
		if (typeof images === 'string') {
			try {
				const parsed = JSON.parse(images);
				return Array.isArray(parsed) ? (parsed as Photo[]) : [];
			} catch {
				return [];
			}
		}
		return Array.isArray(images) ? (images as Photo[]) : [];
	}
}
