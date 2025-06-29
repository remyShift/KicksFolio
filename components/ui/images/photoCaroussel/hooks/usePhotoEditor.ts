import { Alert } from 'react-native';
import { Photo } from '@/types/Sneaker';
import { ImageService } from '@/services/ImageService';
import SupabaseImageService from '@/services/SupabaseImageService';
import { useSession } from '@/context/authContext';

export const usePhotoEditor = (
	photos: Photo[],
	onPhotosChange?: (photos: Photo[]) => void,
	scrollToIndex?: (index: number) => void,
	currentIndex?: number,
	sneakerId?: string
) => {
	const { user } = useSession();

	const handleImageSelection = async (
		type: 'camera' | 'gallery',
		replaceIndex?: number
	) => {
		if (type === 'camera') {
			const imageUri = await ImageService.takeSneakerPhoto();
			if (!imageUri) return;

			const newPhotos = [...photos];

			if (replaceIndex !== undefined) {
				const oldPhoto = newPhotos[replaceIndex];

				if (
					oldPhoto.id &&
					user &&
					sneakerId &&
					oldPhoto.uri.includes('supabase')
				) {
					try {
						await SupabaseImageService.deleteSpecificSneakerImage(
							user.id,
							sneakerId,
							oldPhoto.id
						);
					} catch (error) {
						console.error(
							'❌ usePhotoEditor.handleImageSelection: Error deleting old image:',
							error
						);
					}
				}

				newPhotos[replaceIndex] = {
					id: `temp_${Date.now()}`,
					uri: imageUri,
					alt: newPhotos[replaceIndex].alt,
				};
			} else {
				newPhotos.push({
					id: `temp_${Date.now()}`,
					uri: imageUri,
				});
				setTimeout(() => scrollToIndex?.(newPhotos.length - 1), 100);
			}

			onPhotosChange?.(newPhotos);
		} else {
			const maxImages = 3;
			const canAddMultiple =
				replaceIndex === undefined && photos.length < maxImages;

			if (canAddMultiple) {
				const availableSlots = maxImages - photos.length;
				const imageUris = await ImageService.pickMultipleSneakerImages(
					availableSlots
				);
				if (!imageUris || imageUris.length === 0) return;

				const newPhotos = [...photos];
				const imagesToAdd = imageUris;

				imagesToAdd.forEach((uri: string, index: number) => {
					newPhotos.push({
						id: `temp_${Date.now()}_${index}`,
						uri: uri,
					});
				});

				onPhotosChange?.(newPhotos);

				if (imagesToAdd.length > 0) {
					const firstNewIndex = photos.length;
					setTimeout(() => scrollToIndex?.(firstNewIndex), 100);
				}
			} else {
				const imageUri = await ImageService.pickSneakerImage();
				if (!imageUri) return;

				const newPhotos = [...photos];

				if (replaceIndex !== undefined) {
					const oldPhoto = newPhotos[replaceIndex];

					if (
						oldPhoto.id &&
						user &&
						sneakerId &&
						oldPhoto.uri.includes('supabase')
					) {
						try {
							await SupabaseImageService.deleteSpecificSneakerImage(
								user.id,
								sneakerId,
								oldPhoto.id
							);
						} catch (error) {
							console.error(
								'❌ usePhotoEditor.handleImageSelection: Error deleting old image:',
								error
							);
						}
					}

					newPhotos[replaceIndex] = {
						id: `temp_${Date.now()}`,
						uri: imageUri,
						alt: newPhotos[replaceIndex].alt,
					};
				} else {
					newPhotos.push({
						id: `temp_${Date.now()}`,
						uri: imageUri,
					});
					setTimeout(
						() => scrollToIndex?.(newPhotos.length - 1),
						100
					);
				}

				onPhotosChange?.(newPhotos);
			}
		}
	};

	const removeImage = (index: number) => {
		const photoToRemove = photos[index];

		if (
			photoToRemove.id &&
			user &&
			sneakerId &&
			photoToRemove.uri.includes('supabase')
		) {
			SupabaseImageService.deleteSpecificSneakerImage(
				user.id,
				sneakerId,
				photoToRemove.id
			).catch((error) => {
				console.error('Error deleting image from Supabase:', error);
			});
		}

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
					text: 'Choose from gallery',
					onPress: () =>
						handleImageSelection('gallery', replaceIndex),
				},
				{
					text: 'Take a photo',
					onPress: () => handleImageSelection('camera', replaceIndex),
				},
				{
					text: 'Cancel',
					style: 'cancel',
				} as any,
			]
		);
	};

	return {
		handleImageSelection,
		removeImage,
		showImagePicker,
	};
};
