import { Alert } from 'react-native';
import { Photo } from '@/types/Sneaker';
import { imageService } from '@/services/ImageService';
import SupabaseImageService from '@/services/SupabaseImageService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const usePhotoEditor = (
	photos: Photo[],
	onPhotosChange?: (photos: Photo[]) => void,
	scrollToIndex?: (index: number) => void,
	currentIndex?: number,
	sneakerId?: string
) => {
	const { user } = useSupabaseAuth();

	const handleImageSelection = async (
		type: 'camera' | 'gallery',
		replaceIndex?: number
	) => {
		if (type === 'camera') {
			const imageUri = await imageService.takePhoto();
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
						console.error('Error deleting old image:', error);
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
			// Pour la galerie, utiliser la sélection multiple
			const imageUris = await imageService.pickMultipleImages();
			if (!imageUris || imageUris.length === 0) return;

			const newPhotos = [...photos];

			if (replaceIndex !== undefined) {
				// Si plusieurs images sélectionnées, traiter comme un ajout intelligent
				if (imageUris.length > 1) {
					// Remplacer l'image à l'index donné par la première
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
							console.error('Error deleting old image:', error);
						}
					}

					newPhotos[replaceIndex] = {
						id: `temp_${Date.now()}`,
						uri: imageUris[0],
						alt: newPhotos[replaceIndex].alt,
					};

					// Ajouter les images supplémentaires
					const maxImages = 3;
					const availableSlots = maxImages - newPhotos.length;
					const remainingImages = imageUris.slice(1); // Exclure la première déjà utilisée
					const imagesToAdd = remainingImages.slice(
						0,
						availableSlots
					);

					imagesToAdd.forEach((uri, index) => {
						newPhotos.push({
							id: `temp_${Date.now()}_${index + 1}`,
							uri: uri,
						});
					});

					onPhotosChange?.(newPhotos);
				} else {
					// Mode remplacement normal avec une seule image
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
							console.error('Error deleting old image:', error);
						}
					}

					newPhotos[replaceIndex] = {
						id: `temp_${Date.now()}`,
						uri: imageUris[0],
						alt: newPhotos[replaceIndex].alt,
					};

					onPhotosChange?.(newPhotos);
				}
			} else {
				// Mode ajout : ajouter toutes les images possibles
				const maxImages = 3;
				const availableSlots = maxImages - newPhotos.length;
				const imagesToAdd = imageUris.slice(0, availableSlots);

				imagesToAdd.forEach((uri, index) => {
					newPhotos.push({
						id: `temp_${Date.now()}_${index}`,
						uri: uri,
					});
				});

				onPhotosChange?.(newPhotos);

				// Faire défiler vers la première nouvelle image ajoutée
				if (imagesToAdd.length > 0) {
					const firstNewIndex = photos.length;
					setTimeout(() => scrollToIndex?.(firstNewIndex), 100);
				}
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
