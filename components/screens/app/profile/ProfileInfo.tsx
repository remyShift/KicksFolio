import { Text, View } from 'react-native';
import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import SocialMediaLinks from './SocialMediaLinks';
import { User } from '@/types/User';
import { useSession } from '@/context/authContext';
import { SearchUser } from '@/services/UserSearchService';
import MainButton from '@/components/ui/buttons/MainButton';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProfileInfoProps {
    user: User | SearchUser;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
    const { user: currentUser, userSneakers } = useSession();
    const { t } = useTranslation();
    
    const { userProfile, isLoading, handleFollowToggle, isFollowLoading } = useUserProfile(user.id);

    if (!user) return null;

    const isOwnProfile = currentUser?.id === user.id;

    if (!isOwnProfile && !userProfile) {
        return null;
    }

    const displayUser = isOwnProfile ? user : userProfile?.userSearch;
    const displaySneakers = isOwnProfile 
        ? (userSneakers || [])
        : (userProfile?.sneakers || []);

    if (!displayUser) {
        return null;
    }

    const isFollowing = 'is_following' in displayUser ? displayUser.is_following : false;
    const buttonText = isFollowing ? t('social.unfollow') : t('social.follow');
    const buttonColor = isFollowing ? 'bg-primary' : 'bg-gray-300';

    return (
        <View className="flex-1 flex-row gap-4 items-center justify-center" testID='profile-info'>
            <View className="flex-col gap-2 items-center justify-center">
                <ProfileAvatar
                    profilePictureUrl={displayUser.profile_picture || null} 
                />
                
                <View>
                    <View className="flex-col items-center">
                        <Text className="font-open-sans-bold text-lg text-center">
                            {displayUser.first_name} {displayUser.last_name}
                        </Text>
                        <View className="flex gap-2">
                            <Text className="font-open-sans text-base text-primary text-center">
                                @{displayUser.username}
                            </Text>
                            <SocialMediaLinks user={displayUser} isOwnProfile={isOwnProfile} />
                        </View>
                    </View>
                </View>

            </View>

            <View className="flex items-center justify-center gap-2">
                <ProfileStats 
                    sneakersCount={displaySneakers.length}
                    followersCount={displayUser.followers_count || 0}
                    sneakers={displaySneakers}
                    followingCount={displayUser.following_count || 0}
                />
                {!isOwnProfile && (
                    <MainButton 
                        content={buttonText}
                        onPressAction={handleFollowToggle}
                        backgroundColor={buttonColor}
                        isDisabled={isFollowLoading}
                        width='full'
                    />
                )}
            </View>
        </View>
    );
} 