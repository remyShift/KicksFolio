import * as ImagePicker from 'expo-image-picker';

export function useImagePicker() {
    const handleImageSelection = async (type: 'camera' | 'gallery'): Promise<string | null> => {
        let status;
        if (type === 'camera') {
            ({ status } = await ImagePicker.requestCameraPermissionsAsync());
            if (status !== 'granted') {
                return null;
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8
            });
            if (!result.canceled) {
                return result.assets[0].uri;
            }
        } else {
            ({ status } = await ImagePicker.requestMediaLibraryPermissionsAsync());
            if (status !== 'granted') {
                return null;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            });
            if (!result.canceled) {
                return result.assets[0].uri;
            }
        }
        return null;
    };

    return { handleImageSelection };
} 