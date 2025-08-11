import {
	ImageInfo,
	ImageUploadOptions,
	ImageValidationResult,
	SneakerPhoto,
	UploadResult,
} from '@/types/image';

export interface ImageHandlerInterface {
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

export class ImageHandler {
	constructor(private readonly imageHandler: ImageHandlerInterface) {}

	uploadImage = async (
		imageUri: string,
		options: ImageUploadOptions
	): Promise<UploadResult> => {
		console.log(
			'🖼️ ImageHandler.uploadImage: Starting upload for bucket:',
			options.bucket
		);

		return Promise.resolve()
			.then(() => this.imageHandler.uploadImage(imageUri, options))
			.then((result: UploadResult) => {
				if (result.success) {
					console.log(
						'✅ ImageHandler.uploadImage: Upload successful'
					);
				} else if (result.error) {
					console.warn(
						'⚠️ ImageHandler.uploadImage: Upload failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.uploadImage: Error occurred:',
					error
				);
				throw new Error(`Image upload failed: ${error.message}`);
			});
	};

	uploadSneakerImages = async (
		images: Array<{ uri: string }>,
		userId: string,
		sneakerId: string
	): Promise<UploadResult[]> => {
		console.log(
			'🖼️ ImageHandler.uploadSneakerImages: Uploading',
			images.length,
			'images'
		);

		return Promise.resolve()
			.then(() =>
				this.imageHandler.uploadSneakerImages(images, userId, sneakerId)
			)
			.then((results: UploadResult[]) => {
				const successful = results.filter((r) => r.success).length;
				console.log(
					`✅ ImageHandler.uploadSneakerImages: ${successful}/${results.length} uploads successful`
				);
				return results;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.uploadSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images upload failed: ${error.message}`
				);
			});
	};

	uploadProfileImage = async (
		imageUri: string,
		userId: string
	): Promise<UploadResult> => {
		return Promise.resolve()
			.then(() => this.imageHandler.uploadProfileImage(imageUri, userId))
			.then((result: UploadResult) => {
				if (result.error) {
					console.error(
						'⚠️ ImageHandler.uploadProfileImage: Upload failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.uploadProfileImage: Error occurred:',
					error
				);
				throw new Error(
					`Profile image upload failed: ${error.message}`
				);
			});
	};

	deleteImage = async (
		bucket: 'sneakers' | 'profiles',
		filePath: string
	): Promise<boolean> => {
		console.log(
			'🗑️ ImageHandler.deleteImage: Deleting image from bucket:',
			bucket
		);

		return Promise.resolve()
			.then(() => this.imageHandler.deleteImage(bucket, filePath))
			.then((success: boolean) => {
				if (success) {
					console.log(
						'✅ ImageHandler.deleteImage: Image deleted successfully'
					);
				} else {
					console.warn(
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
	};

	extractFilePathFromUrl = async (
		url: string,
		bucket: string
	): Promise<string | null> => {
		return this.imageHandler.extractFilePathFromUrl(url, bucket);
	};

	getSignedUrl = async (
		bucket: 'sneakers' | 'profiles',
		filePath: string,
		expiresIn: number = 3600
	): Promise<string | null> => {
		return Promise.resolve()
			.then(() =>
				this.imageHandler.getSignedUrl(bucket, filePath, expiresIn)
			)
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
	};

	validateImageUri = async (
		imageUri: string
	): Promise<ImageValidationResult> => {
		return Promise.resolve()
			.then(() => this.imageHandler.validateImageUri(imageUri))
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.validateImageUri: Error occurred:',
					error
				);
				return {
					isValid: false,
					error: `Image validation failed: ${error.message}`,
				};
			});
	};

	getImageInfo = async (imageUri: string): Promise<ImageInfo> => {
		return Promise.resolve()
			.then(() => this.imageHandler.getImageInfo(imageUri))
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.getImageInfo: Error occurred:',
					error
				);
				return { exists: false };
			});
	};

	migrateImageFromUrl = async (
		sourceUrl: string,
		options: ImageUploadOptions
	): Promise<UploadResult> => {
		return Promise.resolve()
			.then(() =>
				this.imageHandler.migrateImageFromUrl(sourceUrl, options)
			)
			.then((result: UploadResult) => {
				if (result.error) {
					console.error(
						'⚠️ ImageHandler.migrateImageFromUrl: Migration failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.migrateImageFromUrl: Error occurred:',
					error
				);
				throw new Error(`Image migration failed: ${error.message}`);
			});
	};

	deleteUserFolder = async (
		bucket: 'sneakers' | 'profiles',
		userId: string
	): Promise<boolean> => {
		return Promise.resolve()
			.then(() => this.imageHandler.deleteUserFolder(bucket, userId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageHandler.deleteUserFolder: Failed to delete user folder'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.deleteUserFolder: Error occurred:',
					error
				);
				throw new Error(
					`User folder deletion failed: ${error.message}`
				);
			});
	};

	deleteAllUserFiles = async (userId: string): Promise<boolean> => {
		return Promise.resolve()
			.then(() => this.imageHandler.deleteAllUserFiles(userId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageHandler.deleteAllUserFiles: Failed to delete some user files'
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
	};

	deleteSneakerImages = async (
		userId: string,
		sneakerId: string
	): Promise<boolean> => {
		return Promise.resolve()
			.then(() =>
				this.imageHandler.deleteSneakerImages(userId, sneakerId)
			)
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageHandler.deleteSneakerImages: Failed to delete sneaker images'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.deleteSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images deletion failed: ${error.message}`
				);
			});
	};

	processAndUploadSneakerImages = async (
		images: Array<{ uri: string; id?: string }>,
		userId: string,
		sneakerId: string
	): Promise<SneakerPhoto[]> => {
		console.log(
			'🔄 ImageHandler.processAndUploadSneakerImages: Processing',
			images.length,
			'images'
		);

		return Promise.resolve()
			.then(() =>
				this.imageHandler.processAndUploadSneakerImages(
					images,
					userId,
					sneakerId
				)
			)
			.then((processedImages: SneakerPhoto[]) => {
				console.log(
					`✅ ImageHandler.processAndUploadSneakerImages: ${processedImages.length} images processed successfully`
				);
				return processedImages;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.processAndUploadSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images processing failed: ${error.message}`
				);
			});
	};

	deleteSpecificSneakerImage = async (
		userId: string,
		sneakerId: string,
		fileName: string
	): Promise<boolean> => {
		return Promise.resolve()
			.then(() =>
				this.imageHandler.deleteSpecificSneakerImage(
					userId,
					sneakerId,
					fileName
				)
			)
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ ImageHandler.deleteSpecificSneakerImage: Failed to delete specific image'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ ImageHandler.deleteSpecificSneakerImage: Error occurred:',
					error
				);
				throw new Error(
					`Specific sneaker image deletion failed: ${error.message}`
				);
			});
	};
}
