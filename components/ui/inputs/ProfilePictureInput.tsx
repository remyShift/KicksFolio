import { View, Text, Pressable, Alert, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface ProfilePictureInputProps {
    imageUri: string | null;
    onChange: (uri: string) => void;
    label?: string;
    handleImageSelection: (source: 'camera' | 'gallery') => Promise<string | null>;
}

export default function ProfilePictureInput({ imageUri, onChange, label = 'Profile Picture', handleImageSelection }: ProfilePictureInputProps) {
    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>{label}</Text>
            {imageUri ?
                <View className='w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center'>
                    <Image 
                        source={{ uri: imageUri }} 
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 100
                        }}
                        resizeMode='cover'
                    /> 
                </View>
                : 
                <Pressable 
                    className='w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center'
                    onPress={() => {
                        Alert.alert(
                            'Add a profile picture',
                            'Choose a profile picture',
                            [
                                {
                                    text: 'Take a photo',
                                    onPress: () => handleImageSelection('camera').then(uri => { if (uri) onChange(uri); })
                                },
                                {
                                    text: 'Choose from gallery',
                                    onPress: () => handleImageSelection('gallery').then(uri => { if (uri) onChange(uri); })
                                },
                                {
                                    text: 'Cancel',
                                    style: 'cancel'
                                }
                            ]
                        );
                    }}
                >
                    <FontAwesome5 name="user-edit" size={24} color="white" />
                </Pressable>
            }
        </View>
    );
} 