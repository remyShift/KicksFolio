import { t } from 'i18next';

import { supabase } from '@/config/supabase/supabase';
import { sneakerSizeConverter } from '@/d/SneakerSizeConverter';
import { SneakerHandlerInterface } from '@/domain/SneakerHandler';
import { GenderType, SizeUnit, Sneaker } from '@/types/sneaker';
import { sneakerBrandOptions } from '@/validation/utils';

class SneakerProxy implements SneakerHandlerInterface {
	async getByUserId(userId: string): Promise<Sneaker[]> {
		const { data, error } = await supabase
			.from('collections')
			.select(
				`
				*,
				sneakers (
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

		const result =
			data?.map((collection, index) => {
				const {
					created_at,
					updated_at,
					sneakers,
					sneaker_id,
					user_id,
					...collectionData
				} = collection;
				const sneakerData = sneakers as any;

				const { id: sneakerModelId, ...sneakerDataWithoutId } =
					sneakerData;

				const transformedSneaker = {
					id: collection.id,
					sneaker_id: sneakerData.id,
					user_id: collection.user_id,
					...collectionData,
					...sneakerDataWithoutId,
					images: SneakerProxy.parseImages(collection.images),
				} as Sneaker;

				return transformedSneaker;
			}) || [];

		return result;
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

	async create(
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

		const {
			size,
			brand,
			model,
			gender,
			sku,
			description,
			images,
			...collectionData
		} = sneakerData;

		let sneakerId: string;

		const { data: existingSneaker } = await supabase
			.from('sneakers')
			.select('id')
			.eq('brand', brand)
			.eq('model', model)
			.eq('gender', gender)
			.eq('sku', sku || '')
			.single();

		if (existingSneaker) {
			sneakerId = existingSneaker.id;
		} else {
			const { data: newSneaker, error: sneakerError } = await supabase
				.from('sneakers')
				.insert([
					{
						brand,
						model,
						gender,
						sku,
						description,
					},
				])
				.select('id')
				.single();

			if (sneakerError) throw sneakerError;
			if (!newSneaker) throw new Error('Failed to create sneaker');

			sneakerId = newSneaker.id;
		}

		const collectionEntry = {
			user_id: user.id,
			sneaker_id: sneakerId,
			size_eu,
			size_us,
			images,
			...collectionData,
		};

		const { data: collection, error: collectionError } = await supabase
			.from('collections')
			.insert([collectionEntry])
			.select(
				`
				*,
				sneakers (
					id,
					brand,
					model,
					gender,
					sku,
					description
				)
			`
			)
			.single();

		if (collectionError) throw collectionError;
		if (!collection) throw new Error('Failed to create collection');

		const {
			created_at,
			updated_at,
			sneakers,
			sneaker_id,
			user_id,
			...collectionDataResult
		} = collection;
		const sneakerDataResult = sneakers as any;

		return {
			id: collection.id,
			sneaker_id: sneakerDataResult.id,
			user_id: collection.user_id,
			...collectionDataResult,
			...sneakerDataResult,
			images: SneakerProxy.parseImages(collection.images),
		} as Sneaker;
	}

	async update(
		collectionId: string,
		updates: Partial<Sneaker & { size?: number }>,
		currentUnit?: SizeUnit
	): Promise<Sneaker> {
		const {
			brand,
			model,
			gender,
			sku,
			description,
			size,
			...collectionUpdates
		} = updates;

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
				collectionUpdates.size_eu = size_eu;
				collectionUpdates.size_us = size_us;
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
		}

		if (Object.keys(collectionUpdates).length > 0) {
			const { error: collectionError } = await supabase
				.from('collections')
				.update(collectionUpdates)
				.eq('id', collectionId);

			if (collectionError) throw collectionError;
		}

		if (
			brand ||
			model ||
			gender ||
			sku !== undefined ||
			description !== undefined
		) {
			const { data: collection, error: getError } = await supabase
				.from('collections')
				.select('sneaker_id')
				.eq('id', collectionId)
				.single();

			if (getError) throw getError;
			if (!collection) throw new Error('Collection not found');

			const sneakerUpdates: any = {};
			if (brand) sneakerUpdates.brand = brand;
			if (model) sneakerUpdates.model = model;
			if (gender) sneakerUpdates.gender = gender;
			if (sku !== undefined) sneakerUpdates.sku = sku;
			if (description !== undefined)
				sneakerUpdates.description = description;

			const { error: sneakerError } = await supabase
				.from('sneakers')
				.update(sneakerUpdates)
				.eq('id', collection.sneaker_id);

			if (sneakerError) throw sneakerError;
		}

		const { data, error } = await supabase
			.from('collections')
			.select(
				`
				*,
				sneakers (
					id,
					brand,
					model,
					gender,
					sku,
					description
				)
			`
			)
			.eq('id', collectionId)
			.single();

		if (error) throw error;
		if (!data) throw new Error('Updated collection not found');

		const {
			created_at,
			updated_at,
			sneakers,
			sneaker_id,
			user_id,
			...collectionData
		} = data;
		const sneakerData = sneakers as any;

		return {
			id: data.id,
			sneaker_id: sneakerData.id,
			user_id: data.user_id,
			...collectionData,
			...sneakerData,
			images: SneakerProxy.parseImages(data.images),
		} as Sneaker;
	}

	async delete(collectionId: string) {
		const { error } = await supabase
			.from('collections')
			.delete()
			.eq('id', collectionId);

		if (error) throw error;
	}

	async updateWishlist(collectionId: string, wishlist: boolean) {
		const { data, error } = await supabase
			.from('collections')
			.update({ wishlist })
			.eq('id', collectionId)
			.select(
				`
				*,
				sneakers (
					id,
					brand,
					model,
					gender,
					sku,
					description
				)
			`
			)
			.single();

		if (error) throw error;

		if (!data) return data;

		const {
			created_at,
			updated_at,
			sneakers,
			sneaker_id,
			user_id,
			...collectionData
		} = data;
		const sneakerData = sneakers as any;

		return {
			id: data.id,
			sneaker_id: sneakerData.id,
			user_id: data.user_id,
			...collectionData,
			...sneakerData,
			images: SneakerProxy.parseImages(data.images),
		} as Sneaker;
	}

	async uploadImage(sneakerId: string, imageUri: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const fileName = `${user.id}/${sneakerId}/${Date.now()}.jpg`;

		const response = await fetch(imageUri);
		const blob = await response.blob();

		const { error } = await supabase.storage
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

export const sneakerProxy = new SneakerProxy();
