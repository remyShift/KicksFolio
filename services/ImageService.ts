import ImagePicker from 'react-native-image-crop-picker';
import { Alert } from 'react-native';

export class ImageService {
	async pickImage(): Promise<string | null> {
		return ImagePicker.openPicker({
			width: 300,
			height: 400,
			cropping: true,
			mediaType: 'photo',
			includeBase64: false,
			compressImageQuality: 0.85,
		})
			.then((image) => {
				return image.path;
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', "Can't select image");
				}
				return null;
			});
	}

	async pickMultipleImages(maxImages: number = 3): Promise<string[] | null> {
		return ImagePicker.openPicker({
			multiple: true,
			maxFiles: Math.max(1, Math.min(maxImages, 3)),
			mediaType: 'photo',
			includeBase64: false,
			compressImageQuality: 0.85,
		})
			.then((images) => {
				return images.map((image) => image.path);
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', "Can't select images");
				}
				return null;
			});
	}

	async takePhoto(): Promise<string | null> {
		return ImagePicker.openCamera({
			width: 300,
			height: 400,
			cropping: true,
			mediaType: 'photo',
			includeBase64: false,
			compressImageQuality: 0.8,
		})
			.then((image) => {
				return image.path;
			})
			.catch((error) => {
				if (error.code !== 'E_PICKER_CANCELLED') {
					Alert.alert('Error', "Can't take photo");
				}
				return null;
			});
	}

	async cleanupTempImages(): Promise<void> {
		return ImagePicker.clean()
			.then(() => {
				console.log('Temporary images cleaned');
			})
			.catch((error) => {
				console.log('Error cleaning temporary images:', error);
			});
	}
}

export const imageService = new ImageService();
