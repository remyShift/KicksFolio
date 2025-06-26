import { View } from 'react-native';
import { Image } from 'expo-image';
import Feather from '@expo/vector-icons/Feather';


export default function ProfileAvatar({ profilePictureUrl }: { profilePictureUrl: string | null }) {
    if (profilePictureUrl) {
        return (
        <View className='w-36 h-36 rounded-full'>
            <Image 
                source={{ uri: profilePictureUrl }} 
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 100,
                    borderWidth: 4,
                    borderColor: '#F27329',
                }}
                contentFit="cover"
                contentPosition="center" 
                cachePolicy="memory-disk"
            />
        </View>
        );
    }

    return (
        <View className='w-36 h-36 bg-primary rounded-full items-center justify-center'>
            <Feather name="user" size={40} color="white" />
        </View>
    );
} 