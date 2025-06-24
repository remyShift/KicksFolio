import { Alert } from 'react-native';
import { Photo } from '@/types/Sneaker';
import { imageService } from '@/services/ImageService';

export const usePhotoEditor = (
	photos: Photo[],
	onPhotosChange?: (photos: Photo[]) => void,
	scrollToIndex?: (index: number) => void,
	currentIndex?: number
) => {
	const handleImageSelection = async (
		type: 'camera' | 'gallery',
		replaceIndex?: number
	) => {
		const imageUri =
			type === 'camera'
				? await imageService.takePhoto()
				: await imageService.pickImage();

		if (!imageUri) return;

		const newPhotos = [...photos];

		if (replaceIndex !== undefined) {
			newPhotos[replaceIndex] = {
				id: newPhotos[replaceIndex].id || '',
				uri: imageUri,
				alt: newPhotos[replaceIndex].alt,
			};
		} else {
			newPhotos.push({
				id: '',
				uri: imageUri,
			});
			setTimeout(() => scrollToIndex?.(newPhotos.length - 1), 100);
		}

		onPhotosChange?.(newPhotos);
	};

	const removeImage = (index: number) => {
		const newPhotos = photos.filter((_, i) => i !== index);
		onPhotosChange?.(newPhotos);

		if (
			currentIndex !== undefined &&
			currentIndex >= newPhotos.length &&
			newPhotos.length > 0
		) {
			setTimeout(() => scrollToIndex?.(newPhotos.length - 1), 100);
		}
	};

	const showImagePicker = (replaceIndex?: number) => {
		Alert.alert(
			replaceIndex !== undefined ? 'Replace photo' : 'Add a photo',
			'Make sure the sneaker is in the center of the image.',
			[
				{
					text: 'Take a photo',
					onPress: () => handleImageSelection('camera', replaceIndex),
				},
				{
					text: 'Choose from gallery',
					onPress: () =>
						handleImageSelection('gallery', replaceIndex),
				},
				{
					text: 'Cancel',
					style: 'cancel',
				},
			]
		);
	};

	return {
		handleImageSelection,
		removeImage,
		showImagePicker,
	};
};
