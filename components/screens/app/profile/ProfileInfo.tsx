import { Text, View } from 'react-native';
import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import SocialMediaLinks from './SocialMediaLinks';
import { User } from '@/types/User';
import { Sneaker } from '@/types/Sneaker';
import { useSession } from '@/context/authContext';
import { SearchUser } from '@/services/UserSearchService';
import MainButton from '@/components/ui/buttons/MainButton';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProfileInfoProps {
    user: User | SearchUser;
    userSneakers: Sneaker[] | null;
}

export default function ProfileInfo({ user, userSneakers }: ProfileInfoProps) {
    const { user: currentUser } = useSession();
    const { t } = useTranslation();
    
    const { userProfile, handleFollowToggle, isFollowLoading } = useUserProfile(user.id);

    if (!user) return null;

    const isOwnProfile = currentUser?.id === user.id;
    
    const displayUser = userProfile?.userSearch || user;
    const displaySneakers = userProfile?.sneakers || userSneakers || [];

    const isFollowing = 'is_following' in displayUser ? displayUser.is_following : false;
    const buttonText = isFollowing ? t('social.unfollow') : t('social.follow');
    const buttonColor = isFollowing ? 'bg-gray-500' : 'bg-primary';

    return (
        <View className="flex-col gap-8 items-center" testID='profile-info'>
            <View className="flex-col gap-2 items-center">
                <ProfileAvatar
                    profilePictureUrl={displayUser.profile_picture || null} 
                />
                
                <View className="flex-row gap-4 items-center">
                    <View className="flex-col items-center">
                        <Text className="font-open-sans-bold text-xl text-center">
                            {displayUser.first_name} {displayUser.last_name}
                        </Text>
                        <Text className="font-open-sans text-lg text-primary text-center">
                            @{displayUser.username}
                        </Text>
                    </View>

                    <SocialMediaLinks user={displayUser} isOwnProfile={isOwnProfile} />
                </View>

                {!isOwnProfile && (
                    <MainButton 
                        content={buttonText}
                        onPressAction={handleFollowToggle}
                        backgroundColor={buttonColor}
                        isDisabled={isFollowLoading}
                    />
                )}
            </View>

                
            <ProfileStats 
                sneakersCount={displaySneakers.length}
                friendsCount={'followers_count' in displayUser ? displayUser.followers_count : 0}
                sneakers={displaySneakers}
            />
        </View>
    );
} 