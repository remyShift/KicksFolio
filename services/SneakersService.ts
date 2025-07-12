import { supabase } from './supabase';
import { SneakerBrand } from '@/types/Sneaker';
import { sneakerBrandOptions } from '@/validation/schemas';
import { SizeConversionService, GenderType } from './SizeConversionService';
import { t } from 'i18next';

export interface SupabaseSneaker {
	id: string;
	brand: SneakerBrand;
	model: string;
	size_eu: number;
	size_us: number;
	purchase_date?: string;
	price_paid?: number;
	condition: number;
	estimated_value?: number;
	description?: string;
	status: string;
	images: { id: string; uri: string }[];
	user_id: string;
	created_at: string;
	updated_at: string;
	wishlist?: boolean;
	og_box?: boolean;
	gender?: 'men' | 'women';
	ds?: boolean;
	sku?: string;
}

export class SupabaseSneakerService {
	static async getSneakersByUser(userId: string) {
		const { data, error } = await supabase
			.from('sneakers')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;

		return (
			data?.map((sneaker) => ({
				...sneaker,
				images: this.parseImages(sneaker.images),
			})) || []
		);
	}

	private static parseImages(images: any): { id: string; uri: string }[] {
		if (!images) return [];

		if (
			Array.isArray(images) &&
			images.length > 0 &&
			typeof images[0] === 'object' &&
			(images[0].uri || images[0].url)
		) {
			return images.map((img: any) => ({
				id: img.id || '',
				uri: img.uri || img.url || '',
			}));
		}

		if (Array.isArray(images)) {
			return images.map((img) => {
				if (typeof img === 'string') {
					try {
						const parsed = JSON.parse(img);
						return {
							id: parsed.id || '',
							uri: parsed.uri || parsed.url || '',
						};
					} catch (error) {
						console.warn('Erreur parsing image JSON:', error);
						return { id: '', uri: img };
					}
				}
				return { id: img.id || '', uri: img.uri || img.url || '' };
			});
		}

		if (typeof images === 'string') {
			try {
				const parsed = JSON.parse(images);
				if (Array.isArray(parsed)) {
					return parsed.map((img: any) => ({
						id: img.id || '',
						uri: img.uri || img.url || '',
					}));
				}
				return [
					{
						id: parsed.id || '',
						uri: parsed.uri || parsed.url || '',
					},
				];
			} catch (error) {
				console.warn('Erreur parsing images JSON string:', error);
				return [{ id: '', uri: images }];
			}
		}

		return [];
	}

	static async createSneaker(
		sneakerData: Omit<
			SupabaseSneaker,
			| 'id'
			| 'created_at'
			| 'updated_at'
			| 'user_id'
			| 'size_eu'
			| 'size_us'
		> & { size: number }
	) {
		console.log('🔄 Creating sneaker with data:', sneakerData);

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) {
			console.error('❌ Auth error:', authError);
			throw authError;
		}
		if (!user) {
			console.error('❌ No user found');
			throw new Error('No user found');
		}

		const { size_eu, size_us } = SizeConversionService.generateBothSizes(
			sneakerData.size,
			(sneakerData.gender as GenderType) || 'men'
		);

		const { size, ...sneakerDataWithoutSize } = sneakerData;

		const sneakerWithUser = {
			...sneakerDataWithoutSize,
			size_eu,
			size_us,
			user_id: user.id,
		};

		const { data, error } = await supabase
			.from('sneakers')
			.insert([sneakerWithUser])
			.select()
			.single();

		if (error) {
			console.error('❌ Database error:', error);
			console.error('Error details:', {
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code,
			});
			throw error;
		}

		console.log('✅ Sneaker created successfully:', data);

		return data
			? {
					...data,
					images: this.parseImages(data.images),
			  }
			: data;
	}

	static async updateSneaker(
		id: string,
		updates: Partial<SupabaseSneaker & { size?: number }>
	) {
		if (updates.size) {
			const { size_eu, size_us } =
				SizeConversionService.generateBothSizes(
					updates.size,
					(updates.gender as GenderType) || 'men'
				);

			const { size, ...updatesWithoutSize } = updates;
			updates = {
				...updatesWithoutSize,
				size_eu,
				size_us,
			};
		}

		const { data, error } = await supabase
			.from('sneakers')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;

		return data
			? {
					...data,
					images: this.parseImages(data.images),
			  }
			: data;
	}

	static async deleteSneaker(id: string) {
		const { error } = await supabase.from('sneakers').delete().eq('id', id);

		if (error) throw error;
	}

	static async updateWishlistStatus(id: string, wishlist: boolean) {
		const { data, error } = await supabase
			.from('sneakers')
			.update({ wishlist })
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;

		return data
			? {
					...data,
					images: this.parseImages(data.images),
			  }
			: data;
	}

	static async uploadSneakerImage(sneakerId: string, imageUri: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const fileName = `${user.id}/${sneakerId}/${Date.now()}.jpg`;

		const response = await fetch(imageUri);
		const blob = await response.blob();

		const { data, error } = await supabase.storage
			.from('sneakers')
			.upload(fileName, blob);

		if (error) throw error;

		const { data: urlData } = supabase.storage
			.from('sneakers')
			.getPublicUrl(fileName);

		return urlData.publicUrl;
	}

	static async searchBySku(sku: string) {
		return supabase.functions
			.invoke('sku-lookup', {
				body: { sku },
			})
			.then(({ data, error }) => {
				const response = data.data;
				if (error) {
					console.error('Supabase function error:', error);
					console.error('Error details:', {
						message: error.message,
						details: error.details,
						hint: error.hint,
						code: error.code,
					});
					throw error;
				}

				if (
					!response ||
					!Array.isArray(response) ||
					response.length === 0
				) {
					const errorMsg = 'No data found for this SKU';
					console.error(errorMsg);
					throw new Error(errorMsg);
				}

				const result = response[0];

				const sneakerBrand = sneakerBrandOptions.find(
					(brand) =>
						brand.value.toLocaleLowerCase() ===
						result.brand.toLowerCase()
				);

				const sneakerModelWithoutBrandName = result.title
					.replace(sneakerBrand?.label || '', '')
					.trim();

				const dataWithoutBrandName = {
					results: [
						{
							...result,
							title: sneakerModelWithoutBrandName,
						},
					],
				};

				console.log('SKU search successful:', dataWithoutBrandName);
				return dataWithoutBrandName;
			})
			.catch((err) => {
				console.error('SKU search failed:', err);
				throw err;
			});
	}

	static async searchByBarcode(barcode: string) {
		return supabase.functions
			.invoke('barcode-lookup', {
				body: { barcode },
			})
			.then(({ data, error }) => {
				if (!data.data) {
					throw t('collection.modal.barcode.noData');
				}

				const response = data.data;

				if (error) {
					console.error('Supabase function error:', error);
					console.error('Error details:', {
						message: error.message,
						details: error.details,
						hint: error.hint,
						code: error.code,
					});
					throw error;
				}

				if (
					!response ||
					!Array.isArray(response) ||
					response.length === 0
				) {
					const errorMsg = 'No data found for this barcode';
					console.error(errorMsg);
					throw new Error(errorMsg);
				}

				const result = response[0];

				const sneakerBrand = sneakerBrandOptions.find(
					(brand) =>
						brand.value.toLocaleLowerCase() ===
						result.brand.toLowerCase()
				);

				const sneakerModelWithoutBrandName = result.title
					.replace(sneakerBrand?.label || '', '')
					.trim();

				const dataWithoutBrandName = {
					results: [
						{
							...result,
							title: sneakerModelWithoutBrandName,
							sku: result.sku.toUpperCase(),
						},
					],
				};

				console.log('Barcode search successful:', dataWithoutBrandName);
				return dataWithoutBrandName;
			})
			.catch((err) => {
				console.error('Barcode search failed:', err);
				throw err;
			});
	}
}
