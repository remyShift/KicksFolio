import { View, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useImagePicker } from '@/hooks/useImagePicker';

interface FormImageInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    size?: number;
    isRounded?: boolean;
}

const FormImageInput = <T extends FieldValues>({
    name,
    control,
    size = 128,
    isRounded = true,
}: FormImageInputProps<T>) => {
    const { handleImageSelection } = useImagePicker();

    const handleImagePress = (onChange: (value: string) => void) => {
        Alert.alert(
            'Choose an image',
            'Select an image from your gallery or take a photo with your camera.',
            [
                {
                    text: 'Choose from gallery',
                    onPress: () => {
                        handleImageSelection('gallery').then(uri => {
                            if (!uri) {
                                Alert.alert('Sorry, we need permission to access your photos!');
                                return;
                            }
                            onChange(uri);
                        }).catch(error => {
                            console.error('❌ FormImageInput.handleImagePress: Gallery selection error', error);
                        });
                    },
                },
                {
                    text: 'Take a photo',
                    onPress: () => {
                        handleImageSelection('camera').then(uri => {
                            if (!uri) {
                                Alert.alert('Sorry, we need permission to access your camera!');
                                return;
                            }
                            onChange(uri);
                        }).catch(error => {
                            console.error('❌ FormImageInput.handleImagePress: Camera error', error);
                        });
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <View className="items-center gap-4">
                    <Pressable 
                        onPress={() => handleImagePress(onChange)}
                        style={{ 
                            width: size, 
                            height: size, 
                            borderRadius: isRounded ? size / 2 : 8 
                        }}
                        className="bg-primary flex-row items-center justify-center overflow-hidden"
                    >
                        {value ? (
                            <Image 
                                source={{ uri: value }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: isRounded ? size / 2 : 8
                                }}
                                contentFit="cover"
                                contentPosition="center"
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <MaterialIcons name="add-a-photo" size={32} color="white" />
                        )}
                    </Pressable>
                </View>
            )}
        />
    );
};

export default FormImageInput; 