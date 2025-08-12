import { supabase } from '@/config/supabase/supabase';
import { WishlistInterface } from '@/domain/Wishlist';
import { SneakerPhoto } from '@/types/image';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

export class WishlistProxy implements WishlistInterface {
	async add(sneakerId: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

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
		return data;
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
			.map(WishlistProxy.transformToSneaker)
			.filter((sneaker): sneaker is Sneaker => sneaker !== null);
	}

	async getBySneakerId(sneakerId: string) {
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
					'🔍 WishlistProxy: Missing sneaker or owner data:',
					{
						sneaker: !!sneaker?.id,
						owner: !!owner?.id,
					}
				);
				return null;
			}

			const parsedImages = WishlistProxy.parseImages(sneaker.images);

			const transformedSneaker = {
				id: String(sneaker.id),
				model: String(sneaker.model || ''),
				price_paid: Number(sneaker.price_paid || 0),
				brand: sneaker.brand as SneakerBrand,
				size_eu: Number(sneaker.size_eu || 0),
				size_us: Number(sneaker.size_us || 0),
				condition: Number(sneaker.condition || 0),
				status: sneaker.status as SneakerStatus,
				description: sneaker.description,
				user_id: String(sneaker.user_id),
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
				sku: String(sneaker.sku || ''),
				gender: String(sneaker.gender || ''),
				og_box: Boolean(sneaker.og_box || false),
				ds: Boolean(sneaker.ds || false),
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

	private static parseImages(images: unknown): SneakerPhoto[] {
		if (!images) return [];

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

export const wishlistProxy = new WishlistProxy();
