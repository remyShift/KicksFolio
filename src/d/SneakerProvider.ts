import { t } from 'i18next';

import { supabase } from '@/config/supabase/supabase';
import { SneakerProviderInterface } from '@/domain/SneakerProviderInterface';
import { GenderType, SizeUnit, Sneaker } from '@/types/sneaker';
import { sneakerBrandOptions } from '@/validation/utils';

import { sneakerSizeConverter } from '../tech/SneakerSizeConverter';

class SneakerProvider implements SneakerProviderInterface {
	async getSneakersByUser(userId: string): Promise<Sneaker[]> {
		const { data, error } = await supabase
			.from('sneakers')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;

		return (
			data?.map((sneaker) => {
				const { created_at, updated_at, ...sneakerWithoutTimestamps } =
					sneaker;
				return {
					...sneakerWithoutTimestamps,
					images: SneakerProvider.parseImages(sneaker.images),
				} as Sneaker;
			}) || []
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
						return {
							id: '',
							uri: img,
						};
					}
				}
				return {
					id: img.id || '',
					uri: img.uri || img.url || '',
				};
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
				return [
					{
						id: '',
						uri: images,
					},
				];
			}
		}

		return [];
	}

	async createSneaker(
		sneakerData: Omit<Sneaker, 'id' | 'user_id' | 'size_eu' | 'size_us'> & {
			size: number;
		},
		currentUnit?: SizeUnit
	): Promise<Sneaker> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) {
			throw authError;
		}
		if (!user) {
			throw new Error('No user found');
		}

		let size_eu: number, size_us: number;

		try {
			const result = sneakerSizeConverter.generateBothSizes(
				sneakerData.size,
				(sneakerData.gender as GenderType) || 'men',
				currentUnit
			);
			size_eu = result.size_eu;
			size_us = result.size_us;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error converting size: ${error.message}`);
			} else {
				throw new Error('Error converting size');
			}
		}

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
			throw error;
		}

		if (!data) return data;

		const { created_at, updated_at, ...sneakerWithoutTimestamps } = data;
		return {
			...sneakerWithoutTimestamps,
			images: SneakerProvider.parseImages(data.images),
		} as Sneaker;
	}

	async updateSneaker(
		id: string,
		updates: Partial<Sneaker & { size?: number }>,
		currentUnit?: SizeUnit
	): Promise<Sneaker> {
		if (updates.size) {
			let size_eu: number, size_us: number;

			try {
				const result = sneakerSizeConverter.generateBothSizes(
					updates.size,
					(updates.gender as GenderType) || 'men',
					currentUnit
				);
				size_eu = result.size_eu;
				size_us = result.size_us;
			} catch (error) {
				console.error('❌ Size conversion error:', error);
				if (error instanceof Error) {
					throw new Error(
						`Erreur de conversion de taille: ${error.message}`
					);
				} else {
					throw new Error('Erreur de conversion de taille inconnue');
				}
			}

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

		if (!data) return data;

		const { created_at, updated_at, ...sneakerWithoutTimestamps } = data;
		return {
			...sneakerWithoutTimestamps,
			images: SneakerProvider.parseImages(data.images),
		} as Sneaker;
	}

	async deleteSneaker(id: string) {
		const { error } = await supabase.from('sneakers').delete().eq('id', id);

		if (error) throw error;
	}

	async updateWishlistStatus(id: string, wishlist: boolean) {
		const { data, error } = await supabase
			.from('sneakers')
			.update({ wishlist })
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;

		if (!data) return data;

		const { created_at, updated_at, ...sneakerWithoutTimestamps } = data;
		return {
			...sneakerWithoutTimestamps,
			images: SneakerProvider.parseImages(data.images),
		} as Sneaker;
	}

	async uploadSneakerImage(sneakerId: string, imageUri: string) {
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

	async searchBySku(sku: string) {
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

	async searchByBarcode(barcode: string) {
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

export const sneakerProvider = new SneakerProvider();
