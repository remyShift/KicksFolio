import { Text, View } from 'react-native';
import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import SocialMediaLinks from './SocialMediaLinks';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';
import { useSession } from '@/context/authContext';
import { SearchUser } from '@/services/UserSearchService';

interface ProfileInfoProps {
    user: User | SearchUser;
    userSneakers: Sneaker[] | null;
}

export default function ProfileInfo({ user, userSneakers }: ProfileInfoProps) {
    const { user: currentUser } = useSession();
    
    if (!user) return null;

    const isOwnProfile = currentUser?.id === user.id;

    return (
        <View className="flex-col gap-8 items-center" testID='profile-info'>
            <View className="flex-col gap-2 items-center">
                <ProfileAvatar
                    profilePictureUrl={user.profile_picture_url || null} 
                />
                
                <View className="flex-row gap-4 items-center">
                    <View className="flex-col items-center">
                        <Text className="font-open-sans-bold text-xl text-center">
                            {user.first_name} {user.last_name}
                        </Text>
                        <Text className="font-open-sans text-lg text-primary text-center">
                            @{user.username}
                        </Text>
                    </View>

                    <SocialMediaLinks user={user} isOwnProfile={isOwnProfile} />
                </View>

            </View>

                
            <ProfileStats 
                sneakersCount={userSneakers?.length || 0}
                friendsCount={0}
            />
        </View>
    );
} 