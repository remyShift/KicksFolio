import * as ImagePicker from 'expo-image-picker';
import { imageService } from '@/services/ImageService';

/**
 * Hook for handling image selection with proper permissions management
 * Uses ImageService for actual image picking operations
 */
export function useImagePicker() {
	const handleImageSelection = async (
		type: 'camera' | 'gallery'
	): Promise<string | null> => {
		let status;

		if (type === 'camera') {
			({ status } = await ImagePicker.requestCameraPermissionsAsync());
			if (status !== 'granted') {
				console.warn('⚠️ useImagePicker: Camera permission not granted');
				return null;
			}
			
			const result = await imageService.takeProfilePhoto();
			return result;
		} else {
			({ status } = await ImagePicker.requestMediaLibraryPermissionsAsync());

			if (status !== 'granted') {
				console.warn('⚠️ useImagePicker: Media library permission not granted');
				return null;
			}
			
			const result = await imageService.pickUserProfileImage();
			return result;
		}
	};

	const handleSneakerImageSelection = async (
		type: 'camera' | 'gallery'
	): Promise<string | null> => {
		let status;

		if (type === 'camera') {
			({ status } = await ImagePicker.requestCameraPermissionsAsync());
			if (status !== 'granted') {
				console.warn('⚠️ useImagePicker: Camera permission not granted');
				return null;
			}
			
			const result = await imageService.takeSneakerPhoto();
			return result;
		} else {
			({ status } = await ImagePicker.requestMediaLibraryPermissionsAsync());

			if (status !== 'granted') {
				console.warn('⚠️ useImagePicker: Media library permission not granted');
				return null;
			}
			
			const result = await imageService.pickSneakerImage();
			return result;
		}
	};

	const handleMultipleSneakerImages = async (maxImages: number = 3): Promise<string[] | null> => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== 'granted') {
			console.warn('⚠️ useImagePicker: Media library permission not granted');
			return null;
		}
		
		const result = await imageService.pickMultipleSneakerImages(maxImages);
		return result;
	};

	return { 
		handleImageSelection, 
		handleSneakerImageSelection, 
		handleMultipleSneakerImages 
	};
}
