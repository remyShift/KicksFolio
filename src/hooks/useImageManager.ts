import { Alert } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { useSession } from '@/contexts/authContext';
import { ImageStorage } from '@/domain/ImageStorage';
import { imageService } from '@/services/ImageService';
import { imageStorageProxy } from '@/tech/proxy/ImageProxy';
import { SneakerPhoto } from '@/types/image';

export type ImageSelectionType = 'camera' | 'gallery';
export type ImagePurpose = 'profile' | 'sneaker';

interface ImageManagerOptions {
	onPhotosChange?: (photos: SneakerPhoto[]) => void;
	scrollToIndex?: (index: number) => void;
	currentIndex?: number;
	sneakerId?: string;
	maxImages?: number;
}

export function useImageManager(
	photos?: SneakerPhoto[],
	options?: ImageManagerOptions
) {
	const { user } = useSession();
	const {
		onPhotosChange,
		scrollToIndex,
		currentIndex,
		sneakerId,
		maxImages = 3,
	} = options || {};

	const imageHandler = new ImageStorage(imageStorageProxy);

	const requestPermissions = async (
		type: ImageSelectionType
	): Promise<boolean> => {
		let status: ImagePicker.PermissionStatus;

		if (type === 'camera') {
			({ status } = await ImagePicker.requestCameraPermissionsAsync());
			if (status !== 'granted') {
				console.warn(
					'⚠️ useImageManager: Camera permission not granted'
				);
				return false;
			}
		} else {
			({ status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync());
			if (status !== 'granted') {
				console.warn(
					'⚠️ useImageManager: Media library permission not granted'
				);
				return false;
			}
		}

		return true;
	};

	const selectSingleImage = async (
		type: ImageSelectionType,
		purpose: ImagePurpose = 'profile'
	): Promise<string | null> => {
		const hasPermission = await requestPermissions(type);
		if (!hasPermission) return null;

		if (type === 'camera') {
			return purpose === 'profile'
				? await imageService.takeProfilePhoto()
				: await imageService.takeSneakerPhoto();
		} else {
			return purpose === 'profile'
				? await imageService.pickUserProfileImage()
				: await imageService.pickSneakerImage();
		}
	};

	const selectMultipleImages = async (
		maxCount: number = maxImages
	): Promise<string[] | null> => {
		const hasPermission = await requestPermissions('gallery');
		if (!hasPermission) return null;

		return await imageService.pickMultipleSneakerImages(maxCount);
	};

	const handleImageSelection = async (
		type: ImageSelectionType,
		replaceIndex?: number
	) => {
		if (!photos || !onPhotosChange) {
			console.warn(
				'⚠️ useImageManager: photos and onPhotosChange are required for advanced image handling'
			);
			return;
		}

		const hasPermission = await requestPermissions(type);
		if (!hasPermission) return;

		if (type === 'camera') {
			const imageUri = await imageService.takeSneakerPhoto();
			if (!imageUri) return;

			await updatePhotosArray(imageUri, replaceIndex);
		} else {
			const canAddMultiple =
				replaceIndex === undefined && photos.length < maxImages;

			if (canAddMultiple) {
				const availableSlots = maxImages - photos.length;
				const imageUris =
					await imageService.pickMultipleSneakerImages(
						availableSlots
					);
				if (!imageUris || imageUris.length === 0) return;

				await addMultiplePhotos(imageUris);
			} else {
				const imageUri = await imageService.pickSneakerImage();
				if (!imageUri) return;

				await updatePhotosArray(imageUri, replaceIndex);
			}
		}
	};

	const updatePhotosArray = async (
		imageUri: string,
		replaceIndex?: number
	) => {
		if (!photos || !onPhotosChange) return;

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
					await imageHandler.deleteSpecificSneaker(
						user.id,
						sneakerId,
						oldPhoto.id
					);
				} catch (error: unknown) {
					console.error(
						'❌ useImageManager: Error deleting old image:',
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

		onPhotosChange(newPhotos);
	};

	const addMultiplePhotos = async (imageUris: string[]) => {
		if (!photos || !onPhotosChange) return;

		const newPhotos = [...photos];

		imageUris.forEach((uri: string, index: number) => {
			newPhotos.push({
				id: `temp_${Date.now()}_${index}`,
				uri: uri,
			});
		});

		onPhotosChange(newPhotos);

		if (imageUris.length > 0) {
			const firstNewIndex = photos.length;
			setTimeout(() => scrollToIndex?.(firstNewIndex), 100);
		}
	};

	const removeImage = async (index: number) => {
		if (!photos || !onPhotosChange) return;

		const photoToRemove = photos[index];

		if (
			photoToRemove.id &&
			user &&
			sneakerId &&
			photoToRemove.uri.includes('supabase')
		) {
			try {
				await imageHandler.deleteSpecificSneaker(
					user.id,
					sneakerId,
					photoToRemove.id
				);
			} catch (error: unknown) {
				console.error(
					'❌ useImageManager: Error deleting image from Supabase:',
					error
				);
			}
		}

		const newPhotos = photos.filter((_, i) => i !== index);
		onPhotosChange(newPhotos);

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
				},
			]
		);
	};

	const showSimpleImagePicker = (
		purpose: ImagePurpose = 'profile',
		onSelection: (uri: string | null) => void
	) => {
		Alert.alert(
			'Choose an image',
			'Select an image from your gallery or take a photo with your camera.',
			[
				{
					text: 'Choose from gallery',
					onPress: async () => {
						const uri = await selectSingleImage('gallery', purpose);
						onSelection(uri);
					},
				},
				{
					text: 'Take a photo',
					onPress: async () => {
						const uri = await selectSingleImage('camera', purpose);
						onSelection(uri);
					},
				},
				{
					text: 'Cancel',
					style: 'cancel',
				},
			]
		);
	};

	return {
		selectSingleImage,
		selectMultipleImages,
		showSimpleImagePicker,

		handleImageSelection,
		removeImage,
		showImagePicker,

		requestPermissions,
	};
}
