import { t } from 'i18next';

import { supabase } from '@/config/supabase/supabase';
import { sneakerSizeConverter } from '@/d/SneakerSizeConverter';
import { SneakerHandlerInterface } from '@/domain/SneakerHandler';
import { DbCollectionWithSneaker } from '@/types/database';
import { GenderType, SizeUnit, Sneaker } from '@/types/sneaker';
import { mapDbCollectionToSneaker } from '@/utils/mappers';
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
				)
			`
			)
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) throw error;

		const result =
			data?.map((dbCollection: DbCollectionWithSneaker) =>
				mapDbCollectionToSneaker(dbCollection)
			) || [];

		return result;
	}

	async create(
		sneakerData: Omit<Sneaker, 'id' | 'user_id' | 'size_eu' | 'size_us'> & {
			size: number;
			fetchedImage?: string;
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
			brand_id,
			model,
			gender,
			sku,
			description,
			images,
			fetchedImage,
			...collectionData
		} = sneakerData;

		let sneakerId: string;

		const { data: existingSneaker } = await supabase
			.from('sneakers')
			.select('id, image')
			.eq('brand_id', brand_id)
			.eq('model', model)
			.eq('gender', gender)
			.eq('sku', sku || '')
			.single();

		if (existingSneaker) {
			sneakerId = existingSneaker.id;

			if (!existingSneaker.image && sneakerData.fetchedImage) {
				const { error: updateError } = await supabase
					.from('sneakers')
					.update({ image: sneakerData.fetchedImage })
					.eq('id', existingSneaker.id);

				if (updateError) {
					console.warn(
						'Failed to update sneaker image:',
						updateError
					);
				}
			}
		} else {
			const { data: newSneaker, error: sneakerError } = await supabase
				.from('sneakers')
				.insert([
					{
						brand_id,
						model,
						gender,
						sku,
						description,
						image: sneakerData.fetchedImage || null,
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
			images: images || [],
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
				)
			`
			)
			.single();

		if (collectionError) throw collectionError;
		if (!collection) throw new Error('Failed to create collection');

		return mapDbCollectionToSneaker(collection as DbCollectionWithSneaker);
	}

	async update(
		collectionId: string,
		updates: Partial<Sneaker & { size?: number }>,
		currentUnit?: SizeUnit
	): Promise<Sneaker> {
		// First, verify the collection exists
		const { data: existingCollection, error: checkError } = await supabase
			.from('collections')
			.select('id, sneaker_id')
			.eq('id', collectionId)
			.single();

		if (checkError) {
			console.error(
				'❌ SneakerHandler.update: Collection check failed:',
				checkError
			);
			if (checkError.code === 'PGRST116') {
				throw new Error(
					`Collection not found with id: ${collectionId}`
				);
			}
			throw checkError;
		}

		if (!existingCollection) {
			throw new Error(`Collection not found with id: ${collectionId}`);
		}

		const {
			brand_id,
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
			brand_id ||
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

			const sneakerUpdates: Partial<{
				brand_id: number;
				model: string;
				gender: string;
				sku: string;
				description: string;
			}> = {};
			if (brand_id) sneakerUpdates.brand_id = brand_id;
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
				)
			`
			)
			.eq('id', collectionId)
			.single();

		if (error) {
			console.error('❌ SneakerHandler.update: Error occurred:', error);
			// Si la collection n'existe pas, on essaie de la récupérer directement
			if (error.code === 'PGRST116') {
				const { data: retryData, error: retryError } = await supabase
					.from('collections')
					.select(
						`
						*,
						sneakers (
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
						)
					`
					)
					.eq('id', collectionId)
					.maybeSingle();

				if (retryError) {
					console.error(
						'❌ SneakerHandler.update: Retry failed:',
						retryError
					);
					throw retryError;
				}

				if (!retryData) {
					throw new Error(
						`Collection not found with id: ${collectionId}`
					);
				}

				return mapDbCollectionToSneaker(
					retryData as DbCollectionWithSneaker
				);
			}
			throw error;
		}
		if (!data) throw new Error('Updated collection not found');

		return mapDbCollectionToSneaker(data as DbCollectionWithSneaker);
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
				)
			`
			)
			.single();

		if (error) throw error;

		if (!data) return data;

		return mapDbCollectionToSneaker(data as DbCollectionWithSneaker);
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
						brand.label.toLocaleLowerCase() ===
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
						brand.label.toLocaleLowerCase() ===
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

				return dataWithoutBrandName;
			})
			.catch((err) => {
				console.error('Barcode search failed:', err);
				throw err;
			});
	}
}

export const sneakerProxy = new SneakerProxy();
