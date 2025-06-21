import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

interface UploadResult {
	success: boolean;
	url?: string;
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
		const { bucket, userId, entityId, quality = 0.8 } = options;

		return this.validateImageUri(imageUri)
			.then((validation) => {
				if (!validation.isValid) {
					throw new Error(validation.error);
				}

				const timestamp = Date.now();
				const fileName = entityId
					? `${userId}/${entityId}/${timestamp}.jpg`
					: `${userId}/${timestamp}.jpg`;

				return FileSystem.readAsStringAsync(imageUri, {
					encoding: FileSystem.EncodingType.Base64,
				}).then((base64) => ({ base64, fileName }));
			})
			.then(({ base64, fileName }) => {
				const binaryString = atob(base64);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}

				return supabase.storage
					.from(bucket)
					.upload(fileName, bytes, {
						contentType: 'image/jpeg',
						upsert: false,
					})
					.then((result) => ({ ...result, fileName }));
			})
			.then(({ data, error, fileName }) => {
				if (error) {
					throw new Error(error.message);
				}

				const { data: urlData } = supabase.storage
					.from(bucket)
					.getPublicUrl(fileName);

				return {
					success: true,
					url: urlData.publicUrl,
				};
			})
			.catch((error) => {
				return {
					success: false,
					error:
						error instanceof Error
							? error.message
							: 'Unknown error occurred',
				};
			});
	}

	static async uploadSneakerImages(
		images: Array<{ url: string }>,
		userId: string,
		sneakerId?: string
	): Promise<string[]> {
		const uploadPromises = images.map((image, index) =>
			this.uploadImage(image.url, {
				bucket: 'sneakers',
				userId,
				entityId: sneakerId || `temp_${Date.now()}_${index}`,
			})
		);

		const results = await Promise.allSettled(uploadPromises);

		const successfulUrls: string[] = [];
		results.forEach((result, index) => {
			if (result.status === 'fulfilled' && result.value.success) {
				successfulUrls.push(result.value.url!);
			} else {
				console.error(
					`Failed to upload image ${index}:`,
					result.status === 'rejected'
						? result.reason
						: result.value.error
				);
			}
		});

		return successfulUrls;
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
		const { data: fileExists, error: checkError } = await supabase.storage
			.from(bucket)
			.list(filePath.split('/').slice(0, -1).join('/'));

		if (checkError) {
			return false;
		}

		const fileName = filePath.split('/').pop();
		const fileFound = fileExists?.some((file) => file.name === fileName);

		if (!fileFound) {
			return true;
		}

		const { data, error } = await supabase.storage
			.from(bucket)
			.remove([filePath]);

		if (error) {
			return false;
		}

		const { data: listData, error: listError } = await supabase.storage
			.from(bucket)
			.list(filePath.split('/').slice(0, -1).join('/'));

		if (!listError && listData) {
			const fileStillExists = listData.some(
				(file) => file.name === fileName
			);

			if (fileStillExists) {
				return false;
			}
			return true;
		}

		return true;
	}

	static extractFilePathFromUrl(url: string, bucket: string): string | null {
		const bucketPattern = new RegExp(`/${bucket}/(.+)$`);
		const match = url.match(bucketPattern);
		return match ? match[1] : null;
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
			console.error('Error creating signed URL:', error);
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
		const response = await fetch(sourceUrl);

		if (!response.ok) {
			return {
				success: false,
				error: `Failed to fetch image from ${sourceUrl}: ${response.status} ${response.statusText}`,
			};
		}

		const blob = await response.blob();

		if (blob.size === 0) {
			return {
				success: false,
				error: 'Downloaded image data is empty',
			};
		}

		const { bucket, userId, entityId } = options;

		const timestamp = Date.now();
		const fileName = entityId
			? `${userId}/${entityId}/${timestamp}.jpg`
			: `${userId}/${timestamp}.jpg`;

		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(fileName, blob, {
				contentType:
					response.headers.get('content-type') || 'image/jpeg',
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
		};
	}
}

export default SupabaseImageService;
