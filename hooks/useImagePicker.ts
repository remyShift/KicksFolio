import { ImageService } from '@/services/ImageService';
import * as ImagePicker from 'expo-image-picker';

export function useImagePicker() {
	const handleImageSelection = async (
		type: 'camera' | 'gallery'
	): Promise<string | null> => {
		let status;

		if (type === 'camera') {
			({ status } = await ImagePicker.requestCameraPermissionsAsync());
			if (status !== 'granted') {
				return null;
			}
			const result = await ImageService.takeProfilePhoto();

			if (!result) {
				return null;
			}

			return result;
		} else {
			({ status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync());

			if (status !== 'granted') {
				return null;
			}
			const result = await ImageService.pickUserProfileImage();

			if (!result) {
				return null;
			}

			return result;
		}
		return null;
	};

	return { handleImageSelection };
}
