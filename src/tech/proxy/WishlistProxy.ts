import { supabase } from '@/config/supabase/supabase';
import { WishlistInterface } from '@/domain/Wishlist';
import { SneakerPhoto } from '@/types/image';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

export class WishlistProxy implements WishlistInterface {
	async add(collectionId: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		// Update the collection to mark it as wishlisted
		const { data, error } = await supabase
			.from('collections')
			.update({ wishlist: true })
			.eq('id', collectionId)
			.eq('user_id', user.id) // Security: ensure user owns this collection
			.select()
			.single();

		if (error) throw error;
		if (!data) throw new Error('Collection not found or not owned by user');

		return {
			id: data.id,
			user_id: data.user_id,
			sneaker_id: data.sneaker_id,
			created_at: data.updated_at,
		};
	}

	async remove(collectionId: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { error } = await supabase
			.from('collections')
			.update({ wishlist: false })
			.eq('id', collectionId)
			.eq('user_id', user.id); // Security: ensure user owns this collection

		if (error) throw error;
	}

	async contains(collectionId: string): Promise<boolean> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('collections')
			.select('wishlist')
			.eq('id', collectionId)
			.eq('user_id', user.id) // Security: ensure user owns this collection
			.single();

		if (error && error.code !== 'PGRST116') throw error;
		return !!data?.wishlist;
	}

	async getByUserId(userId: string): Promise<Sneaker[]> {
		// Pour la wishlist, on récupère les collections directement avec les infos sneaker
		const { data, error } = await supabase
			.from('collections')
			.select(
				`
				*,
				sneakers!inner (
					id,
					brand,
					model,
					gender,
					sku,
					description
				),
				users!inner (
					id,
					username,
					first_name,
					last_name,
					profile_picture
				)
			`
			)
			.eq('wishlist', true)
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		if (!data) return [];

		return data
			.map(WishlistProxy.transformCollectionToSneaker)
			.filter((sneaker): sneaker is Sneaker => sneaker !== null);
	}

	async getBySneakerId(sneakerId: string) {
		// Get collections that have this sneaker in wishlist
		const { data, error } = await supabase
			.from('collections')
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
			.eq('sneaker_id', sneakerId)
			.eq('wishlist', true);

		if (error) throw error;
		return data || [];
	}

	private static transformCollectionToSneaker(
		collection: Record<string, any>
	): Sneaker | null {
		try {
			const sneaker = collection?.sneakers;
			const owner = collection?.users;

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

			const parsedImages = WishlistProxy.parseImages(collection.images);

			const transformedSneaker = {
				id: String(collection.id), // Collection ID becomes the Sneaker ID
				model: String(sneaker.model || ''),
				price_paid: Number(collection.price_paid || 0),
				brand: sneaker.brand as SneakerBrand,
				size_eu: Number(collection.size_eu || 0),
				size_us: Number(collection.size_us || 0),
				condition: Number(collection.condition || 0),
				status: collection.status as SneakerStatus,
				description: sneaker.description,
				user_id: String(collection.user_id),
				estimated_value: Number(collection.estimated_value || 0),
				images: parsedImages,
				owner: {
					id: String(owner.id),
					username: String(owner.username || ''),
					first_name: String(owner.first_name || ''),
					last_name: String(owner.last_name || ''),
					profile_picture_url: String(owner.profile_picture || ''),
				},
				wishlist_added_at: String(collection.created_at),
				sku: String(sneaker.sku || ''),
				gender: String(sneaker.gender || ''),
				og_box: Boolean(collection.og_box || false),
				ds: Boolean(collection.ds || false),
			};

			return transformedSneaker;
		} catch (error) {
			console.error(
				'❌ WishlistProxy: Error transforming collection item:',
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
