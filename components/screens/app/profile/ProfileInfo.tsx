import { Text, View } from 'react-native';
import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';

interface ProfileInfoProps {
    user: User | null;
    userSneakers: Sneaker[] | null;
}

export default function ProfileInfo({ user, userSneakers }: ProfileInfoProps) {
    if (!user) return null;

    return (
        <View className="flex-col gap-8 items-center" testID='profile-info'>
            <View className="flex-col gap-2 items-center">
                <ProfileAvatar 
                    profilePictureUrl={user.profile_picture_url} 
                />
                
                <View className="flex-col items-center">
                    <Text className="font-spacemono-bold text-xl text-center">
                        {user.first_name} {user.last_name}
                    </Text>
                    <Text className="font-spacemono text-lg text-primary text-center">
                        @{user.username}
                    </Text>
                </View>
            </View>
                
                <ProfileStats 
                    sneakersCount={userSneakers?.length || 0}
                    friendsCount={0}
                />
        </View>
    );
} 