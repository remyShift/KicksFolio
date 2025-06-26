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
        <View className="flex-col gap-4 items-center" testID='profile-info'>
                <ProfileAvatar 
                    profilePictureUrl={user.profile_picture_url} 
                />
                
                <View className="gap-2">
                    <Text className="font-spacemono text-lg">
                        {user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)} {user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1)}
                    </Text>
                    <Text className="font-spacemono text-lg text-primary">
                        @{user.username}
                    </Text>
                </View>
                
                <ProfileStats 
                    sneakersCount={userSneakers?.length || 0}
                    friendsCount={0}
                    totalValue={0}
                />
        </View>
    );
} 