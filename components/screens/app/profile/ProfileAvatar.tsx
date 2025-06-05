import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Feather from '@expo/vector-icons/Feather';


interface ProfileAvatarProps {
    profilePictureUrl?: string;
    username: string;
}

export default function ProfileAvatar({ profilePictureUrl, username }: ProfileAvatarProps) {
    if (profilePictureUrl) {
        return (
        <View className='w-24 h-24 rounded-full'>
            <Image 
            source={{ uri: profilePictureUrl }} 
            style={{
                width: '100%',
                height: '100%',
                borderRadius: 100
            }}
            contentFit="cover"
            contentPosition="center" 
            cachePolicy="memory-disk"
            />
        </View>
        );
    }

    return (
        <View className='w-24 h-24 bg-primary rounded-full items-center justify-center'>
            <Feather name="user" size={40} color="white" />
        </View>
    );
} 