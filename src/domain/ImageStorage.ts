import {
	ImageInfo,
	ImageUploadOptions,
	ImageValidationResult,
	SneakerPhoto,
	UploadResult,
} from '@/types/image';

export interface ImageStorageInterface {
	upload(
		imageUri: string,
		options: ImageUploadOptions
	): Promise<UploadResult>;

	uploadSneakerImages(
		images: Array<{ uri: string }>,
		userId: string,
		sneakerId: string
	): Promise<UploadResult[]>;

	uploadProfileImage(imageUri: string, userId: string): Promise<UploadResult>;

	delete(
		bucket: 'sneakers' | 'profiles' | 'sneakers-reference',
		filePath: string
	): Promise<boolean>;

	extractFilePathFromUrl(url: string, bucket: string): string | null;

	getSignedUrl(
		bucket: 'sneakers' | 'profiles' | 'sneakers-reference',
		filePath: string,
		expiresIn?: number
	): Promise<string | null>;

	validateUri(imageUri: string): Promise<ImageValidationResult>;

	getInfo(imageUri: string): Promise<ImageInfo>;

	migrate(
		sourceUrl: string,
		options: ImageUploadOptions
	): Promise<UploadResult>;

	deleteUser(
		bucket: 'sneakers' | 'profiles' | 'sneakers-reference',
		userId: string
	): Promise<boolean>;

	deleteAllUserFiles(userId: string): Promise<boolean>;

	deleteSneaker(userId: string, sneakerId: string): Promise<boolean>;

	processAndUploadSneaker(
		images: Array<{ uri: string; id?: string }>,
		userId: string,
		sneakerId: string
	): Promise<SneakerPhoto[]>;

	deleteSpecificSneaker(
		userId: string,
		sneakerId: string,
		fileName: string
	): Promise<boolean>;
}

export class ImageStorage {
	constructor(private readonly imageStorageProxy: ImageStorageInterface) {}

	upload = async (
		imageUri: string,
		options: ImageUploadOptions
	): Promise<UploadResult> => {
		console.log(
			'🖼️ imageStorageProxy.uploadImage: Starting upload for bucket:',
			options.bucket
		);

		return Promise.resolve()
			.then(() => this.imageStorageProxy.upload(imageUri, options))
			.then((result: UploadResult) => {
				if (result.success) {
					console.log(
						'✅ imageStorageProxy.uploadImage: Upload successful'
					);
				} else if (result.error) {
					console.warn(
						'⚠️ imageStorageProxy.uploadImage: Upload failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.uploadImage: Error occurred:',
					error
				);
				throw new Error(`Image upload failed: ${error.message}`);
			});
	};

	uploadSneaker = async (
		images: Array<{ uri: string }>,
		userId: string,
		sneakerId: string
	): Promise<UploadResult[]> => {
		console.log(
			'🖼️ imageStorageProxy.uploadSneakerImages: Uploading',
			images.length,
			'images'
		);

		return Promise.resolve()
			.then(() =>
				this.imageStorageProxy.uploadSneakerImages(
					images,
					userId,
					sneakerId
				)
			)
			.then((results: UploadResult[]) => {
				const successful = results.filter((r) => r.success).length;
				console.log(
					`✅ imageStorageProxy.uploadSneakerImages: ${successful}/${results.length} uploads successful`
				);
				return results;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.uploadSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images upload failed: ${error.message}`
				);
			});
	};

	uploadProfile = async (
		imageUri: string,
		userId: string
	): Promise<UploadResult> => {
		return Promise.resolve()
			.then(() =>
				this.imageStorageProxy.uploadProfileImage(imageUri, userId)
			)
			.then((result: UploadResult) => {
				if (result.error) {
					console.error(
						'⚠️ imageStorageProxy.uploadProfileImage: Upload failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.uploadProfileImage: Error occurred:',
					error
				);
				throw new Error(
					`Profile image upload failed: ${error.message}`
				);
			});
	};

	delete = async (
		bucket: 'sneakers' | 'profiles' | 'sneakers-reference',
		filePath: string
	): Promise<boolean> => {
		console.log(
			'🗑️ imageStorageProxy.deleteImage: Deleting image from bucket:',
			bucket
		);

		return Promise.resolve()
			.then(() => this.imageStorageProxy.delete(bucket, filePath))
			.then((success: boolean) => {
				if (success) {
					console.log(
						'✅ imageStorageProxy.deleteImage: Image deleted successfully'
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
		return this.imageStorageProxy.extractFilePathFromUrl(url, bucket);
	};

	getSignedUrl = async (
		bucket: 'sneakers' | 'profiles' | 'sneakers-reference',
		filePath: string,
		expiresIn: number = 3600
	): Promise<string | null> => {
		return Promise.resolve()
			.then(() =>
				this.imageStorageProxy.getSignedUrl(bucket, filePath, expiresIn)
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

	validateUri = async (imageUri: string): Promise<ImageValidationResult> => {
		return Promise.resolve()
			.then(() => this.imageStorageProxy.validateUri(imageUri))
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.validateImageUri: Error occurred:',
					error
				);
				return {
					isValid: false,
					error: `Image validation failed: ${error.message}`,
				};
			});
	};

	getInfo = async (imageUri: string): Promise<ImageInfo> => {
		return Promise.resolve()
			.then(() => this.imageStorageProxy.getInfo(imageUri))
			.catch((error: Error) => {
				console.error(
					'❌ ImageProviderInterface.getImageInfo: Error occurred:',
					error
				);
				return { exists: false };
			});
	};

	migrate = async (
		sourceUrl: string,
		options: ImageUploadOptions
	): Promise<UploadResult> => {
		return Promise.resolve()
			.then(() => this.imageStorageProxy.migrate(sourceUrl, options))
			.then((result: UploadResult) => {
				if (result.error) {
					console.error(
						'⚠️ imageStorageProxy.migrateImageFromUrl: Migration failed:',
						result.error
					);
				}
				return result;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.migrateImageFromUrl: Error occurred:',
					error
				);
				throw new Error(`Image migration failed: ${error.message}`);
			});
	};

	deleteUser = async (
		bucket: 'sneakers' | 'profiles' | 'sneakers-reference',
		userId: string
	): Promise<boolean> => {
		return Promise.resolve()
			.then(() => this.imageStorageProxy.deleteUser(bucket, userId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ imageStorageProxy.deleteUserFolder: Failed to delete user folder'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.deleteUserFolder: Error occurred:',
					error
				);
				throw new Error(
					`User folder deletion failed: ${error.message}`
				);
			});
	};

	deleteAll = async (userId: string): Promise<boolean> => {
		return Promise.resolve()
			.then(() => this.imageStorageProxy.deleteAllUserFiles(userId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ imageStorageProxy.deleteAllUserFiles: Failed to delete some user files'
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

	deleteSneaker = async (
		userId: string,
		sneakerId: string
	): Promise<boolean> => {
		return Promise.resolve()
			.then(() => this.imageStorageProxy.deleteSneaker(userId, sneakerId))
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ imageStorageProxy.deleteSneakerImages: Failed to delete sneaker images'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.deleteSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images deletion failed: ${error.message}`
				);
			});
	};

	processAndUploadSneaker = async (
		images: Array<{ uri: string; id?: string }>,
		userId: string,
		sneakerId: string
	): Promise<SneakerPhoto[]> => {
		console.log(
			'🔄 imageStorageProxy.processAndUploadSneakerImages: Processing',
			images.length,
			'images'
		);

		return Promise.resolve()
			.then(() =>
				this.imageStorageProxy.processAndUploadSneaker(
					images,
					userId,
					sneakerId
				)
			)
			.then((processedImages: SneakerPhoto[]) => {
				console.log(
					`✅ imageStorageProxy.processAndUploadSneakerImages: ${processedImages.length} images processed successfully`
				);
				return processedImages;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.processAndUploadSneakerImages: Error occurred:',
					error
				);
				throw new Error(
					`Sneaker images processing failed: ${error.message}`
				);
			});
	};

	deleteSpecificSneaker = async (
		userId: string,
		sneakerId: string,
		fileName: string
	): Promise<boolean> => {
		return Promise.resolve()
			.then(() =>
				this.imageStorageProxy.deleteSpecificSneaker(
					userId,
					sneakerId,
					fileName
				)
			)
			.then((success: boolean) => {
				if (!success) {
					console.error(
						'⚠️ imageStorageProxy.deleteSpecificSneakerImage: Failed to delete specific image'
					);
				}
				return success;
			})
			.catch((error: Error) => {
				console.error(
					'❌ imageStorageProxy.deleteSpecificSneakerImage: Error occurred:',
					error
				);
				throw new Error(
					`Specific sneaker image deletion failed: ${error.message}`
				);
			});
	};
}
