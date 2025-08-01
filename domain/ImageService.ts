import { Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

export class ImageService {
	static async pickSneakerImage(): Promise<string | null> {
		return ImagePicker.openPicker({
			width: 800,
			height: 800,
			cropping: true,
			mediaType: 'photo',
			compressImageQuality: 0.9,
			compressImageMaxWidth: 1200,
			compressImageMaxHeight: 1200,
			freeStyleCropEnabled: true,
		})
			.then((image) => {
				return image.path;
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', 'Can not select image');
				}
				return null;
			});
	}

	static async pickUserProfileImage(): Promise<string | null> {
		return ImagePicker.openPicker({
			width: 800,
			height: 800,
			cropping: true,
			mediaType: 'photo',
			compressImageQuality: 0.9,
			compressImageMaxWidth: 1200,
			compressImageMaxHeight: 1200,
			freeStyleCropEnabled: true,
			cropperCircleOverlay: true,
		})
			.then((image) => {
				return image.path;
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', 'Can not select image');
				}
				return null;
			});
	}

	static async pickMultipleSneakerImages(
		maxImages: number = 3
	): Promise<string[] | null> {
		return ImagePicker.openPicker({
			multiple: true,
			maxFiles: Math.max(1, Math.min(maxImages, 3)),
			mediaType: 'photo',
			includeBase64: false,
			compressImageQuality: 0.9,
			compressImageMaxWidth: 1200,
			compressImageMaxHeight: 1200,
		})
			.then((images) => {
				return images.map((image) => image.path);
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', 'Can not select images');
				}
				return null;
			});
	}

	static async takeSneakerPhoto(): Promise<string | null> {
		return ImagePicker.openCamera({
			width: 800,
			height: 800,
			cropping: true,
			mediaType: 'photo',
			compressImageQuality: 0.9,
			compressImageMaxWidth: 1200,
			compressImageMaxHeight: 1200,
			freeStyleCropEnabled: true,
		})
			.then((image) => {
				return image.path;
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', 'Can not take photo');
				}
				return null;
			});
	}

	static async takeProfilePhoto(): Promise<string | null> {
		return ImagePicker.openCamera({
			width: 800,
			height: 800,
			cropping: true,
			mediaType: 'photo',
			compressImageQuality: 0.9,
			compressImageMaxWidth: 1200,
			compressImageMaxHeight: 1200,
			freeStyleCropEnabled: true,
			cropperCircleOverlay: true,
		})
			.then((image) => {
				return image.path;
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', 'Can not take photo');
				}
				return null;
			});
	}

	static async pickImageWithoutCrop(): Promise<string | null> {
		return ImagePicker.openPicker({
			mediaType: 'photo',
			includeBase64: false,
			compressImageQuality: 0.95,
			compressImageMaxWidth: 2000,
			compressImageMaxHeight: 2000,
		})
			.then((image) => {
				return image.path;
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', 'Can not select image');
				}
				return null;
			});
	}

	static async cleanupTempImages(): Promise<void> {
		return ImagePicker.clean()
			.then(() => {
				console.log('Temp images cleaned');
			})
			.catch((error) => {
				console.log('Error cleaning temp images:', error);
			});
	}
}

export const imageService = new ImageService();
