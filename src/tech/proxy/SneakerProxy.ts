import { t } from 'i18next';

import { supabase } from '@/config/supabase/supabase';
import { sneakerSizeConverter } from '@/d/SneakerSizeConverter';
import { SneakerHandlerInterface } from '@/domain/SneakerHandler';
import { imageStorageProxy } from '@/tech/proxy/ImageProxy';
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

		const normalizeModel = (modelName: string) =>
			modelName.trim().toLowerCase().replace(/\s+/g, ' ');

		let existingSneaker = null;

		if (sku && sku.trim() !== '') {
			const { data: foundBySku, error: skuSearchError } = await supabase
				.from('sneakers')
				.select('id, image')
				.eq('sku', sku.trim())
				.maybeSingle();

			if (skuSearchError && skuSearchError.code !== 'PGRST116') {
				throw skuSearchError;
			}
			existingSneaker = foundBySku;
		}

		if (!existingSneaker) {
			const { data: candidateSneakers, error: modelSearchError } =
				await supabase
					.from('sneakers')
					.select('id, image, model')
					.eq('brand_id', brand_id)
					.eq('gender', gender);

			if (modelSearchError) {
				throw modelSearchError;
			}

			if (candidateSneakers && candidateSneakers.length > 0) {
				const normalizedInputModel = normalizeModel(model);
				existingSneaker = candidateSneakers.find(
					(sneaker) =>
						normalizeModel(sneaker.model) === normalizedInputModel
				);
			}
		}

		if (existingSneaker) {
			sneakerId = existingSneaker.id;

			if (!existingSneaker.image && sneakerData.fetchedImage) {
				const downloadedImage = await this.uploadFetchedImage(
					existingSneaker.id,
					sneakerData.fetchedImage
				);

				const imageJson = JSON.stringify(downloadedImage);

				const { data: updatedSneaker, error: updateError } =
					await supabase
						.from('sneakers')
						.update({ image: imageJson })
						.eq('id', existingSneaker.id)
						.select('*');

				if (updateError) {
					console.warn(
						'❌ Failed to update sneaker image:',
						updateError
					);
				}
			}
		} else {
			if (sneakerData.fetchedImage) {
				const { data: tempSneaker, error: tempError } = await supabase
					.from('sneakers')
					.insert([
						{
							brand_id,
							model,
							gender,
							sku,
							description,
							image: null,
						},
					])
					.select('id')
					.single();

				if (tempError) throw tempError;
				if (!tempSneaker) throw new Error('Failed to create sneaker');

				sneakerId = tempSneaker.id;

				const downloadedImage = await this.uploadFetchedImage(
					tempSneaker.id,
					sneakerData.fetchedImage
				);
				const imageToStore = JSON.stringify(downloadedImage);

				const { data: updatedSneaker, error: updateError } =
					await supabase
						.from('sneakers')
						.update({ image: imageToStore })
						.eq('id', tempSneaker.id);

				if (updateError) {
					console.error(
						'❌ Failed to update sneaker with image:',
						updateError
					);
					throw updateError;
				}

				const { data: verifyData } = await supabase
					.from('sneakers')
					.select('image')
					.eq('id', tempSneaker.id)
					.single();
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
							image: null,
						},
					])
					.select('id')
					.single();

				if (sneakerError) throw sneakerError;
				if (!newSneaker) throw new Error('Failed to create sneaker');

				sneakerId = newSneaker.id;
			}
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
			if (description !== undefined && description !== null)
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

	async getReferenceImage(collectionId: string): Promise<string | null> {
		const { data: existingCollection, error } = await supabase
			.from('collections')
			.select(
				`
				*,
				sneakers (
					image
				)
			`
			)
			.eq('id', collectionId)
			.single();

		if (error) throw error;

		if (!existingCollection?.sneakers?.image) {
			return null;
		}

		try {
			const parsedImage = JSON.parse(existingCollection.sneakers.image);
			return parsedImage.uri || existingCollection.sneakers.image;
		} catch {
			return existingCollection.sneakers.image;
		}
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

	async uploadFetchedImage(
		sneakerId: string,
		imageUrl: string
	): Promise<{ id: string; uri: string }> {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const uploadResult = await imageStorageProxy.migrate(imageUrl, {
			bucket: 'sneakers-reference',
			userId: sneakerId,
			entityId: undefined,
		});

		if (
			!uploadResult.success ||
			!uploadResult.url ||
			!uploadResult.fileName
		) {
			throw new Error(
				uploadResult.error || 'Failed to upload fetched image'
			);
		}

		return {
			id: uploadResult.fileName,
			uri: uploadResult.url,
		};
	}

	async searchBySku(sku: string) {
		const { data: existingSneaker, error: searchError } = await supabase
			.from('sneakers')
			.select('*')
			.eq('sku', sku)
			.maybeSingle();

		if (searchError && searchError.code !== 'PGRST116') {
			console.error('Error checking existing sneaker:', searchError);
		}

		if (existingSneaker) {
			const sneakerBrand = sneakerBrandOptions.find(
				(brand) => parseInt(brand.value) === existingSneaker.brand_id
			);

			return {
				results: [
					{
						title: existingSneaker.model,
						brand: sneakerBrand?.label || 'Unknown',
						sku: existingSneaker.sku,
						description: existingSneaker.description,
						gender: existingSneaker.gender,
						image: existingSneaker.image,
						fromDatabase: true,
					},
				],
			};
		}

		return supabase.functions
			.invoke('sku-lookup', {
				body: { sku },
			})
			.then(async ({ data, error }) => {
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

				try {
					const { data: newSneaker, error: insertError } =
						await supabase
							.from('sneakers')
							.insert([
								{
									brand_id: sneakerBrand
										? parseInt(sneakerBrand.value)
										: 10, // 10 = Other
									model: sneakerModelWithoutBrandName,
									gender: result.gender || 'men',
									sku: result.sku?.toUpperCase(),
									description: result.description || null,
									image: result.image
										? JSON.stringify({ uri: result.image })
										: null,
								},
							])
							.select('*')
							.single();

					if (insertError) {
						console.error(
							'Error creating sneaker in DB:',
							insertError
						);
					} else {
						console.log(
							'Sneaker created successfully in DB:',
							newSneaker.id
						);
					}
				} catch (dbError) {
					console.error(
						'Failed to save sneaker to database:',
						dbError
					);
				}

				const dataWithoutBrandName = {
					results: [
						{
							...result,
							title: sneakerModelWithoutBrandName,
							sku: result.sku?.toUpperCase(),
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
				if (error) {
					console.error('❌ Supabase function error:', error);
					throw new Error(`API Error: ${error.message || error}`);
				}

				if (!data || !data.data) {
					throw new Error(
						'Ce code-barres ne correspond à aucune sneaker dans notre base de données'
					);
				}

				const response = data.data;

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
