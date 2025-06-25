import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

interface UploadResult {
	success: boolean;
	url?: string;
	fileName?: string;
	error?: string;
}

interface ImageUploadOptions {
	bucket: 'sneakers' | 'profiles';
	userId: string;
	entityId?: string;
	quality?: number;
}

export class SupabaseImageService {
	static async uploadImage(
		imageUri: string,
		options: ImageUploadOptions
	): Promise<UploadResult> {
		try {
			const { bucket, userId, entityId, quality = 0.8 } = options;

			const validation = await this.validateImageUri(imageUri);
			if (!validation.isValid) {
				return {
					success: false,
					error: validation.error,
				};
			}

			const timestamp = Date.now();
			const fileName = entityId
				? `${userId}/${entityId}/${timestamp}.jpg`
				: `${userId}/${timestamp}.jpg`;

			const base64 = await FileSystem.readAsStringAsync(imageUri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			const binaryString = atob(base64);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(fileName, bytes, {
					contentType: 'image/jpeg',
					upsert: false,
				});

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			const { data: urlData } = supabase.storage
				.from(bucket)
				.getPublicUrl(fileName);

			return {
				success: true,
				url: urlData.publicUrl,
				fileName: fileName,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Unknown error occurred',
			};
		}
	}

	static async uploadSneakerImages(
		images: Array<{ uri: string }>,
		userId: string,
		sneakerId: string
	): Promise<UploadResult[]> {
		const uploadPromises = images.map((image) =>
			this.uploadImage(image.uri, {
				bucket: 'sneakers',
				userId,
				entityId: sneakerId,
			})
		);

		return Promise.all(uploadPromises);
	}

	static async uploadProfileImage(
		imageUri: string,
		userId: string
	): Promise<UploadResult> {
		return this.uploadImage(imageUri, {
			bucket: 'profiles',
			userId,
		});
	}

	static async deleteImage(
		bucket: 'sneakers' | 'profiles',
		filePath: string
	): Promise<boolean> {
		try {
			const { error } = await supabase.storage
				.from(bucket)
				.remove([filePath]);

			if (error) {
				console.error(
					`Failed to delete image from ${bucket}:`,
					error.message
				);
				return false;
			}

			// Vérification optionnelle que le fichier a bien été supprimé
			// On attend un peu pour que Supabase traite la suppression
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const folderPath = filePath.split('/').slice(0, -1).join('/');
			const fileName = filePath.split('/').pop();

			if (folderPath && fileName) {
				const { data: listData, error: listError } =
					await supabase.storage.from(bucket).list(folderPath);

				if (!listError && listData) {
					const fileStillExists = listData.some(
						(file) => file.name === fileName
					);

					if (fileStillExists) {
						console.warn(
							`File ${fileName} still exists after deletion attempt`
						);
						return false;
					}
				}
			}

			return true;
		} catch (error) {
			console.error('Error deleting image:', error);
			return false;
		}
	}

	static extractFilePathFromUrl(url: string, bucket: string): string | null {
		if (!url || typeof url !== 'string') {
			return null;
		}

		// Pattern pour les URLs Supabase standard
		const supabasePattern = new RegExp(
			`/storage/v1/object/public/${bucket}/(.+)$`
		);
		const supabaseMatch = url.match(supabasePattern);

		if (supabaseMatch) {
			console.log(
				`[DEBUG] extractFilePathFromUrl: Found Supabase pattern match: ${supabaseMatch[1]}`
			);
			return supabaseMatch[1];
		}

		// Pattern plus simple au cas où l'URL est différente
		const simplePattern = new RegExp(`/${bucket}/(.+)$`);
		const simpleMatch = url.match(simplePattern);

		if (simpleMatch) {
			console.log(
				`[DEBUG] extractFilePathFromUrl: Found simple pattern match: ${simpleMatch[1]}`
			);
			return simpleMatch[1];
		}

		// Pattern pour les URLs avec sous-domaine
		const subdomainPattern = new RegExp(
			`supabase\\.co/storage/v1/object/public/${bucket}/(.+)$`
		);
		const subdomainMatch = url.match(subdomainPattern);

		if (subdomainMatch) {
			console.log(
				`[DEBUG] extractFilePathFromUrl: Found subdomain pattern match: ${subdomainMatch[1]}`
			);
			return subdomainMatch[1];
		}

		console.warn(
			`[DEBUG] extractFilePathFromUrl: No pattern matched for URL: ${url}, bucket: ${bucket}`
		);
		return null;
	}

	static async getSignedUrl(
		bucket: 'sneakers' | 'profiles',
		filePath: string,
		expiresIn: number = 3600
	): Promise<string | null> {
		const { data, error } = await supabase.storage
			.from(bucket)
			.createSignedUrl(filePath, expiresIn);

		if (error) {
			return null;
		}

		return data.signedUrl;
	}

	static async compressImage(
		imageUri: string,
		quality: number = 0.8
	): Promise<string> {
		return imageUri;
	}

	static async validateImageUri(imageUri: string): Promise<{
		isValid: boolean;
		error?: string;
		size?: number;
	}> {
		const imageInfo = await FileSystem.getInfoAsync(imageUri);

		if (!imageInfo.exists) {
			return {
				isValid: false,
				error: 'Image file does not exist',
			};
		}

		const maxSize = 10 * 1024 * 1024;
		const fileSize = 'size' in imageInfo ? imageInfo.size : undefined;

		if (fileSize && fileSize > maxSize) {
			return {
				isValid: false,
				error: `Image file too large: ${Math.round(
					fileSize / 1024 / 1024
				)}MB (max: 10MB)`,
			};
		}

		return {
			isValid: true,
			size: fileSize,
		};
	}

	static async getImageInfo(imageUri: string): Promise<{
		exists: boolean;
		size?: number;
		width?: number;
		height?: number;
	}> {
		const info = await FileSystem.getInfoAsync(imageUri);
		const fileSize = 'size' in info ? info.size : undefined;

		return {
			exists: info.exists,
			size: fileSize,
			// Note: width et height nécessitent expo-image-manipulator pour être obtenus
		};
	}

	static async migrateImageFromUrl(
		sourceUrl: string,
		options: ImageUploadOptions
	): Promise<UploadResult> {
		try {
			const { bucket, userId, entityId } = options;
			const timestamp = Date.now();
			const fileName = entityId
				? `${userId}/${entityId}/${timestamp}.jpg`
				: `${userId}/${timestamp}.jpg`;

			const downloadResult = await FileSystem.downloadAsync(
				sourceUrl,
				FileSystem.documentDirectory + 'temp_image.jpg'
			);

			if (downloadResult.status !== 200) {
				return {
					success: false,
					error: `Failed to download image: ${downloadResult.status}`,
				};
			}

			const base64 = await FileSystem.readAsStringAsync(
				downloadResult.uri,
				{
					encoding: FileSystem.EncodingType.Base64,
				}
			);

			const binaryString = atob(base64);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(fileName, bytes, {
					contentType: 'image/jpeg',
					upsert: false,
				});

			await FileSystem.deleteAsync(downloadResult.uri, {
				idempotent: true,
			});

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			const { data: urlData } = supabase.storage
				.from(bucket)
				.getPublicUrl(fileName);

			return {
				success: true,
				url: urlData.publicUrl,
				fileName: fileName,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	static async deleteUserFolder(
		bucket: 'sneakers' | 'profiles',
		userId: string
	): Promise<boolean> {
		return supabase.storage
			.from(bucket)
			.list(userId)
			.then(({ data: files, error: listError }) => {
				if (listError) {
					console.error(
						`Error listing user files in ${bucket}:`,
						listError
					);
					return false;
				}

				if (!files || files.length === 0) {
					return true;
				}

				const filePaths = files.map((file) => `${userId}/${file.name}`);

				return supabase.storage
					.from(bucket)
					.remove(filePaths)
					.then(({ error: deleteError }) => {
						if (deleteError) {
							return false;
						}

						return true;
					});
			})
			.catch((error) => {
				console.error(`Unexpected error deleting user folder:`, error);
				return false;
			});
	}

	static async deleteAllUserFiles(userId: string): Promise<boolean> {
		try {
			const sneakersResult = await this.deleteUserFolder(
				'sneakers',
				userId
			);
			const profilesResult = await this.deleteUserFolder(
				'profiles',
				userId
			);

			return sneakersResult && profilesResult;
		} catch (error) {
			console.error('Error deleting all user files:', error);
			return false;
		}
	}

	static async deleteSneakerImages(
		userId: string,
		sneakerId: string
	): Promise<boolean> {
		return supabase.storage
			.from('sneakers')
			.list(`${userId}/${sneakerId}`)
			.then(({ data: files, error: listError }) => {
				if (listError) {
					console.error('Error listing sneaker images:', listError);
					return false;
				}

				if (!files || files.length === 0) {
					return true;
				}

				const filePaths = files.map(
					(file) => `${userId}/${sneakerId}/${file.name}`
				);

				return supabase.storage
					.from('sneakers')
					.remove(filePaths)
					.then(({ error: deleteError }) => {
						if (deleteError) {
							console.error(
								'Error deleting sneaker images:',
								deleteError
							);
							return false;
						}
						return true;
					});
			})
			.catch((error) => {
				console.error('Error in deleteSneakerImages:', error);
				return false;
			});
	}

	static async processAndUploadSneakerImages(
		images: Array<{ uri: string; id?: string }>,
		userId: string,
		sneakerId: string
	): Promise<Array<{ id: string; uri: string }>> {
		if (!images || images.length === 0) {
			return [];
		}

		const processedImages: Array<{ id: string; uri: string }> = [];

		for (const img of images) {
			if (
				img.uri.startsWith('file://') ||
				img.uri.startsWith('/private/var/mobile/') ||
				img.uri.startsWith('/data/user/') ||
				(!img.uri.startsWith('http') && !img.uri.includes('supabase'))
			) {
				const uploadResult = await this.uploadImage(img.uri, {
					bucket: 'sneakers',
					userId,
					entityId: sneakerId,
				});

				if (
					uploadResult.success &&
					uploadResult.url &&
					uploadResult.fileName
				) {
					processedImages.push({
						id: uploadResult.fileName,
						uri: uploadResult.url,
					});
				}
			} else if (
				img.uri.startsWith('https://') &&
				!img.uri.includes('supabase')
			) {
				const migrationResult = await this.migrateImageFromUrl(
					img.uri,
					{
						bucket: 'sneakers',
						userId,
						entityId: sneakerId,
					}
				);

				if (
					migrationResult.success &&
					migrationResult.url &&
					migrationResult.fileName
				) {
					processedImages.push({
						id: migrationResult.fileName,
						uri: migrationResult.url,
					});
				}
			} else {
				processedImages.push({
					id:
						img.id ||
						this.extractFilePathFromUrl(img.uri, 'sneakers') ||
						'',
					uri: img.uri,
				});
			}
		}

		return processedImages;
	}

	static async deleteSpecificSneakerImage(
		userId: string,
		sneakerId: string,
		fileName: string
	): Promise<boolean> {
		const filePath = fileName.includes('/')
			? fileName
			: `${userId}/${sneakerId}/${fileName}`;

		return supabase.storage
			.from('sneakers')
			.remove([filePath])
			.then(({ error }) => {
				if (error) {
					console.error(
						'Error deleting specific sneaker image:',
						error
					);
					return false;
				}
				return true;
			})
			.catch((error) => {
				console.error('Error in deleteSpecificSneakerImage:', error);
				return false;
			});
	}
}

export default SupabaseImageService;
