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

		const timestamp = Date.now();
		const fileName = entityId
			? `${userId}/${entityId}/${timestamp}.jpg`
			: `${userId}/${timestamp}.jpg`;

		const imageInfo = await FileSystem.getInfoAsync(imageUri);
		if (!imageInfo.exists) {
			return {
				success: false,
				error: 'Image file does not exist',
			};
		}

		const response = await fetch(imageUri);
		const blob = await response.blob();

		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(fileName, blob, {
				contentType: 'image/jpeg',
				upsert: false,
			});

		if (error) {
			console.error('Supabase upload error:', error);
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
		const { error } = await supabase.storage
			.from(bucket)
			.remove([filePath]);

		if (error) {
			console.error('Error deleting image:', error);
			return false;
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

	static async migrateImageFromUrl(
		sourceUrl: string,
		options: ImageUploadOptions
	): Promise<UploadResult> {
		const response = await fetch(sourceUrl);

		if (!response.ok) {
			return {
				success: false,
				error: `Failed to fetch image from ${sourceUrl}`,
			};
		}

		const blob = await response.blob();
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
			console.error('Migration upload error:', error);
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
