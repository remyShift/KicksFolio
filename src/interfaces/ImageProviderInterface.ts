import {
	ImageInfo,
	ImageUploadOptions,
	ImageValidationResult,
	SneakerPhoto,
	UploadResult,
} from '@/types/image';

export interface ImageProviderInterface {
	uploadImage(
		imageUri: string,
		options: ImageUploadOptions
	): Promise<UploadResult>;

	uploadSneakerImages(
		images: Array<{ uri: string }>,
		userId: string,
		sneakerId: string
	): Promise<UploadResult[]>;

	uploadProfileImage(imageUri: string, userId: string): Promise<UploadResult>;

	deleteImage(
		bucket: 'sneakers' | 'profiles',
		filePath: string
	): Promise<boolean>;

	extractFilePathFromUrl(url: string, bucket: string): string | null;

	getSignedUrl(
		bucket: 'sneakers' | 'profiles',
		filePath: string,
		expiresIn?: number
	): Promise<string | null>;

	validateImageUri(imageUri: string): Promise<ImageValidationResult>;

	getImageInfo(imageUri: string): Promise<ImageInfo>;

	migrateImageFromUrl(
		sourceUrl: string,
		options: ImageUploadOptions
	): Promise<UploadResult>;

	deleteUserFolder(
		bucket: 'sneakers' | 'profiles',
		userId: string
	): Promise<boolean>;

	deleteAllUserFiles(userId: string): Promise<boolean>;

	deleteSneakerImages(userId: string, sneakerId: string): Promise<boolean>;

	processAndUploadSneakerImages(
		images: Array<{ uri: string; id?: string }>,
		userId: string,
		sneakerId: string
	): Promise<SneakerPhoto[]>;

	deleteSpecificSneakerImage(
		userId: string,
		sneakerId: string,
		fileName: string
	): Promise<boolean>;
}

export class ImageProviderInterface {
	static async uploadImage(
		imageUri: string,
		options: ImageUploadOptions,
		implementation: ImageProviderInterface['uploadImage']
	): Promise<UploadResult> {
		return Promise.resolve()
			.then(() => implementation(imageUri, options))
			.then((result: UploadResult) => {
				if (result.error) {
					console.error(
						'⚠️ ImageProviderInterface.uploadImage: Upload failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.uploadImage: Error occurred:',
					error
				);
				throw new Error(`Image upload failed: ${error.message}`);
			});
	}

	static async uploadSneakerImages(
		images: Array<{ uri: string }>,
		userId: string,
		sneakerId: string,
		implementation: ImageProviderInterface['uploadSneakerImages']
	): Promise<UploadResult[]> {
		return Promise.resolve()
			.then(() => implementation(images, userId, sneakerId))
			.then((results: UploadResult[]) => {
				const successful = results.filter((r) => r.success).length;
				return results;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.uploadSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images upload failed: ${error.message}`
				);
			});
	}

	static async uploadProfileImage(
		imageUri: string,
		userId: string,
		implementation: ImageProviderInterface['uploadProfileImage']
	): Promise<UploadResult> {
		return Promise.resolve()
			.then(() => implementation(imageUri, userId))
			.then((result: UploadResult) => {
				if (result.error) {
					console.error(
						'⚠️ ImageProviderInterface.uploadProfileImage: Upload failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.uploadProfileImage: Error occurred:',
					error
				);
				throw new Error(
					`Profile image upload failed: ${error.message}`
				);
			});
	}

	static async deleteImage(
		bucket: 'sneakers' | 'profiles',
		filePath: string,
		implementation: ImageProviderInterface['deleteImage']
	): Promise<boolean> {
		return Promise.resolve()
			.then(() => implementation(bucket, filePath))
			.then((success: boolean) => {
				if (success) {
				} else {
					console.error(
						'⚠️ ImageProviderInterface.deleteImage: Failed to delete image'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.deleteImage: Error occurred:',
					error
				);
				throw new Error(`Image deletion failed: ${error.message}`);
			});
	}

	static extractFilePathFromUrl(
		url: string,
		bucket: string,
		implementation: ImageProviderInterface['extractFilePathFromUrl']
	): string | null {
		return implementation(url, bucket);
	}

	static async getSignedUrl(
		bucket: 'sneakers' | 'profiles',
		filePath: string,
		expiresIn: number = 3600,
		implementation: ImageProviderInterface['getSignedUrl']
	): Promise<string | null> {
		return Promise.resolve()
			.then(() => implementation(bucket, filePath, expiresIn))
			.then((url: string | null) => {
				if (!url) {
					console.error(
						'⚠️ ImageProviderInterface.getSignedUrl: Failed to generate signed URL'
					);
				}
				return url;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.getSignedUrl: Error occurred:',
					error
				);
				throw new Error(
					`Signed URL generation failed: ${error.message}`
				);
			});
	}

	static async validateImageUri(
		imageUri: string,
		implementation: ImageProviderInterface['validateImageUri']
	): Promise<ImageValidationResult> {
		return Promise.resolve()
			.then(() => implementation(imageUri))
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.validateImageUri: Error occurred:',
					error
				);
				return {
					isValid: false,
					error: `Image validation failed: ${error.message}`,
				};
			});
	}

	static async getImageInfo(
		imageUri: string,
		implementation: ImageProviderInterface['getImageInfo']
	): Promise<ImageInfo> {
		return Promise.resolve()
			.then(() => implementation(imageUri))
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.getImageInfo: Error occurred:',
					error
				);
				return { exists: false };
			});
	}

	static async migrateImageFromUrl(
		sourceUrl: string,
		options: ImageUploadOptions,
		implementation: ImageProviderInterface['migrateImageFromUrl']
	): Promise<UploadResult> {
		return Promise.resolve()
			.then(() => implementation(sourceUrl, options))
			.then((result: UploadResult) => {
				if (result.error) {
					console.error(
						'⚠️ ImageProviderInterface.migrateImageFromUrl: Migration failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.migrateImageFromUrl: Error occurred:',
					error
				);
				throw new Error(`Image migration failed: ${error.message}`);
			});
	}

	static async deleteUserFolder(
		bucket: 'sneakers' | 'profiles',
		userId: string,
		implementation: ImageProviderInterface['deleteUserFolder']
	): Promise<boolean> {
		return Promise.resolve()
			.then(() => implementation(bucket, userId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageProviderInterface.deleteUserFolder: Failed to delete user folder'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.deleteUserFolder: Error occurred:',
					error
				);
				throw new Error(
					`User folder deletion failed: ${error.message}`
				);
			});
	}

	static async deleteAllUserFiles(
		userId: string,
		implementation: ImageProviderInterface['deleteAllUserFiles']
	): Promise<boolean> {
		return Promise.resolve()
			.then(() => implementation(userId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageProviderInterface.deleteAllUserFiles: Failed to delete some user files'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.deleteAllUserFiles: Error occurred:',
					error
				);
				throw new Error(`User files deletion failed: ${error.message}`);
			});
	}

	static async deleteSneakerImages(
		userId: string,
		sneakerId: string,
		implementation: ImageProviderInterface['deleteSneakerImages']
	): Promise<boolean> {
		return Promise.resolve()
			.then(() => implementation(userId, sneakerId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageProviderInterface.deleteSneakerImages: Failed to delete sneaker images'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.deleteSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images deletion failed: ${error.message}`
				);
			});
	}

	static async processAndUploadSneakerImages(
		images: Array<{ uri: string; id?: string }>,
		userId: string,
		sneakerId: string,
		implementation: ImageProviderInterface['processAndUploadSneakerImages']
	): Promise<SneakerPhoto[]> {
		return Promise.resolve()
			.then(() => implementation(images, userId, sneakerId))
			.then((processedImages: SneakerPhoto[]) => {
				return processedImages;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.processAndUploadSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images processing failed: ${error.message}`
				);
			});
	}

	static async deleteSpecificSneakerImage(
		userId: string,
		sneakerId: string,
		fileName: string,
		implementation: ImageProviderInterface['deleteSpecificSneakerImage']
	): Promise<boolean> {
		return Promise.resolve()
			.then(() => implementation(userId, sneakerId, fileName))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageProviderInterface.deleteSpecificSneakerImage: Failed to delete specific image'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.deleteSpecificSneakerImage: Error occurred:',
					error
				);
				throw new Error(
					`Specific sneaker image deletion failed: ${error.message}`
				);
			});
	}
}
