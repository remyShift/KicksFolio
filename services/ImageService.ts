import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export class ImageService {
	async pickImage(): Promise<string | null> {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permission needed',
				'We need your permission to access your photos.'
			);
			return null;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: true,
			orderedSelection: true,
			selectionLimit: 1,
			aspect: [4, 3],
			quality: 0.85,
		});

		if (result.canceled) {
			return null;
		}

		return result.assets[0].uri;
	}

	async pickMultipleImages(): Promise<string[] | null> {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permission needed',
				'We need your permission to access your photos.'
			);
			return null;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: true,
			orderedSelection: true,
			selectionLimit: 3,
			aspect: [4, 3],
			quality: 0.85,
		});

		if (result.canceled) {
			return null;
		}

		return result.assets.map((asset) => asset.uri);
	}

	async takePhoto(): Promise<string | null> {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permission needed',
				'We need your permission to access your camera.'
			);
			return null;
		}

		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled) {
			return null;
		}

		return result.assets[0].uri;
	}
}

export const imageService = new ImageService();
