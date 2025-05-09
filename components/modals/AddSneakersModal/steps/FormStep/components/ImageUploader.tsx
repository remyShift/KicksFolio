import { View, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploaderProps {
    image: string;
    setImage: (uri: string) => void;
    isError: boolean;
    isFocused: boolean;
    setIsError: (value: boolean) => void;
}

export const ImageUploader = ({ image, setImage, isError, isFocused, setIsError }: ImageUploaderProps) => {
    const pickImage = () => {
        ImagePicker.requestMediaLibraryPermissionsAsync()
            .then(({ status }) => {
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à vos photos.');
                    return;
                }
                return ImagePicker.launchImageLibraryAsync({
                    mediaTypes: "images",
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });
            })
            .then((result) => {
                if (!result) {
                    setIsError(true);
                    return;
                }

                if (!result.canceled) {
                    setImage(result.assets[0].uri);
                } else {
                    setImage('');
                    setIsError(true);
                }
            })
            .catch((error) => {
                console.error('Error when picking image:', error);
            });
    };

    const takePhoto = () => {
        ImagePicker.requestCameraPermissionsAsync()
            .then(({ status }) => {
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à votre caméra.');
                    return;
                }
                return ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });
            })
            .then((result) => {
                if (!result) {
                    setIsError(true);
                    return;
                }

                if (!result.canceled) {
                    setImage(result.assets[0].uri);
                } else {
                    setImage('');
                    setIsError(true);
                }
            });
    };

    return (
        <Pressable
            onPress={() => {
                Alert.alert(
                    'Ajouter une photo',
                    'Assurez-vous que la sneaker est au centre de l\'image.',
                    [
                        {
                            text: 'Prendre une photo',
                            onPress: takePhoto
                        },
                        {
                            text: 'Choisir depuis la galerie',
                            onPress: pickImage
                        },
                        {
                            text: 'Annuler',
                            style: 'cancel'
                        }
                    ]
                );
            }}
            className={`bg-gray-400 rounded-md h-48 w-full flex items-center justify-center ${
                isError ? 'border-2 border-red-500' : ''
            } ${isFocused ? 'border-2 border-primary' : ''}`}
        >
            {image ? (
                <Image
                    source={{ uri: image }}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 3
                    }}
                    contentFit="cover"
                    contentPosition="center"
                    cachePolicy="memory-disk"
                />
            ) : (
                <MaterialIcons name="add-a-photo" size={30} color="white" />
            )}
        </Pressable>
    );
}; 