import { View, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { imageService } from '@/services/ImageService';

interface ImageUploaderProps {
    image: string;
    setImage: (uri: string) => void;
    isError: boolean;
    isFocused: boolean;
    setIsError: (value: boolean) => void;
}

export const ImageUploader = ({ image, setImage, isError, isFocused, setIsError }: ImageUploaderProps) => {
    const handleImageSelection = async (type: 'camera' | 'gallery') => {
        const imageUri = type === 'camera' 
            ? await imageService.takePhoto()
            : await imageService.pickImage();

        if (!imageUri) {
            setIsError(true);
            return;
        }

        setImage(imageUri);
        setIsError(false);
    };

    return (
        <Pressable
            onPress={() => {
                Alert.alert(
                    'Add a photo',
                    'Make sure the sneaker is in the center of the image.',
                    [
                        {
                            text: 'Take a photo',
                            onPress: () => handleImageSelection('camera')
                        },
                        {
                            text: 'Choose from gallery',
                            onPress: () => handleImageSelection('gallery')
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        }
                    ]
                );
            }}
            className={`rounded-md h-48 w-full flex items-center justify-center
                ${isError ? 'border-2 border-red-500' : ''}
                ${image ? '' : 'bg-gray-400'}
                ${isFocused ? 'border-2 border-primary' : ''}`}
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