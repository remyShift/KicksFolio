import { View } from 'react-native';
import Title from '@/components/ui/text/Title';
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
        <View className="flex-col gap-4">
            <Title content={user.username} />

            <View className="flex-row justify-between w-full px-4 gap-4 items-center">
                <ProfileAvatar 
                profilePictureUrl={user.profile_picture_url} 
                username={user.username} 
                />
                
                <ProfileStats 
                sneakersCount={userSneakers?.length || 0}
                friendsCount={0}
                totalValue={0}
                />
            </View>
        </View>
    );
} 