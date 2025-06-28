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
				console.warn(
					'🔍 WishlistService: Missing sneaker or owner data:',
					{ sneaker: !!sneaker?.id, owner: !!owner?.id }
				);
				return null;
			}

			console.log(
				'🔍 WishlistService: Raw sneaker images:',
				sneaker.images
			);
			console.log(
				'🔍 WishlistService: Images type:',
				typeof sneaker.images,
				Array.isArray(sneaker.images)
			);

			const parsedImages = SupabaseWishlistService.parseImages(
				sneaker.images
			);
			console.log('🔍 WishlistService: Parsed images:', parsedImages);

			const transformedSneaker = {
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
				images: parsedImages,
				owner: {
					id: String(owner.id),
					username: String(owner.username || ''),
					first_name: String(owner.first_name || ''),
					last_name: String(owner.last_name || ''),
					profile_picture_url: String(owner.profile_picture || ''),
				},
				wishlist_added_at: String(item.created_at),
			};

			console.log(
				'✅ WishlistService: Transformed sneaker with images:',
				transformedSneaker.images.length
			);
			return transformedSneaker;
		} catch (error) {
			console.error(
				'❌ WishlistService: Error transforming wishlist item:',
				error
			);
			return null;
		}
	}

	private static parseImages(images: unknown): Photo[] {
		if (!images) return [];

		// Si c'est déjà un tableau d'objets avec uri/url
		if (
			Array.isArray(images) &&
			images.length > 0 &&
			typeof images[0] === 'object' &&
			(images[0].uri || images[0].url)
		) {
			return images.map((img: any, index: number) => ({
				id: img.id || String(index),
				uri: img.uri || img.url || '',
				alt: img.alt || `Sneaker image ${index + 1}`,
			}));
		}

		// Si c'est un tableau d'éléments à parser
		if (Array.isArray(images)) {
			return images.map((img: any, index: number) => {
				if (typeof img === 'string') {
					try {
						const parsed = JSON.parse(img);
						return {
							id: parsed.id || String(index),
							uri: parsed.uri || parsed.url || '',
							alt: parsed.alt || `Sneaker image ${index + 1}`,
						};
					} catch (error) {
						console.warn('Erreur parsing image JSON:', error);
						return {
							id: String(index),
							uri: img,
							alt: `Sneaker image ${index + 1}`,
						};
					}
				}
				return {
					id: img.id || String(index),
					uri: img.uri || img.url || '',
					alt: img.alt || `Sneaker image ${index + 1}`,
				};
			});
		}

		// Si c'est une string JSON
		if (typeof images === 'string') {
			try {
				const parsed = JSON.parse(images);
				if (Array.isArray(parsed)) {
					return parsed.map((img: any, index: number) => ({
						id: img.id || String(index),
						uri: img.uri || img.url || '',
						alt: img.alt || `Sneaker image ${index + 1}`,
					}));
				}
				return [
					{
						id: parsed.id || '0',
						uri: parsed.uri || parsed.url || '',
						alt: parsed.alt || 'Sneaker image 1',
					},
				];
			} catch (error) {
				console.warn('Erreur parsing images JSON string:', error);
				return [
					{
						id: '0',
						uri: images,
						alt: 'Sneaker image 1',
					},
				];
			}
		}

		return [];
	}
}
