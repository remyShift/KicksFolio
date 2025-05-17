import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export class ImageService {
    async pickImage(): Promise<string | null> {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled) {
            return null;
        }

        return result.assets[0].uri;
    }

    async takePhoto(): Promise<string | null> {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à votre caméra.');
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