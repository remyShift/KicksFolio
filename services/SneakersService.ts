import { BaseApiService } from '@/services/BaseApiService';
import { supabase } from './supabase';
import { SneakerBrand } from '@/types/Sneaker';
import { sneakerBrandOptions } from '@/validation/schemas';

export interface SupabaseSneaker {
	id: string;
	brand: SneakerBrand;
	model: string;
	size: number;
	purchase_date?: string;
	price_paid?: number;
	condition: number;
	estimated_value?: number;
	description?: string;
	status: string;
	images: { id: string; uri: string }[];
	collection_id: string;
	created_at: string;
	updated_at: string;
}

export class SupabaseSneakerService extends BaseApiService {
	static async getSneakersByCollection(collectionId: string) {
		const { data, error } = await supabase
			.from('sneakers')
			.select('*')
			.eq('collection_id', collectionId)
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
		sneakerData: Omit<SupabaseSneaker, 'id' | 'created_at' | 'updated_at'>
	) {
		const { data, error } = await supabase
			.from('sneakers')
			.insert([sneakerData])
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

	static async updateSneaker(id: string, updates: Partial<SupabaseSneaker>) {
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

				if (!data) {
					const errorMsg = 'No data found for this SKU';
					console.error(errorMsg);
					throw new Error(errorMsg);
				}

				const sneakerBrand = sneakerBrandOptions.find(
					(brand) =>
						brand.value.toLocaleLowerCase() ===
						data.results[0].brand.toLowerCase()
				);

				const sneakerModalWithoutBrandName = data.results[0].name
					.replace(sneakerBrand?.label || '', '')
					.trim();

				const dataWithoutBrandName = {
					...data,
					results: [
						{
							...data.results[0],
							name: sneakerModalWithoutBrandName,
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
}
