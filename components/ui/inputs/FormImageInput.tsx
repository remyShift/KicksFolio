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

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <View className="items-center gap-4">
                    {value ? (
                        <View style={{ width: size, height: size, borderRadius: isRounded ? size / 2 : 8 }}>
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
                        </View>
                    ) : (
                        <Pressable 
                            onPress={() => {
                                Alert.alert(
                                    'Choose an image',
                                    'Select an image from your gallery or take a photo with your camera.',
                                    [
                                        {
                                            text: 'Pick from gallery',
                                            onPress: () => handleImageSelection('gallery').then(uri => {
                                                if (!uri) {
                                                    Alert.alert('Sorry, we need permission to access your photos!');
                                                    return;
                                                }
                                                onChange(uri);
                                            }),
                                        },
                                        {
                                            text: 'Take a photo',
                                            onPress: () => handleImageSelection('camera').then(uri => {
                                                if (!uri) {
                                                    Alert.alert('Sorry, we need permission to access your camera!');
                                                    return;
                                                }
                                                onChange(uri);
                                            }),
                                        },
                                        {
                                            text: 'Cancel',
                                            style: 'cancel'
                                        }
                                    ]
                                );
                            }} 
                            style={{ 
                                width: size, 
                                height: size, 
                                borderRadius: isRounded ? size / 2 : 8 
                            }}
                            className="bg-primary flex-row items-center justify-center"
                        >
                            <MaterialIcons name="add-a-photo" size={32} color="white" />
                        </Pressable>
                    )}
                </View>
            )}
        />
    );
};

export default FormImageInput; 