import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Sneaker } from '@/types/Sneaker';
import FollowButton from '@/components/ui/buttons/FollowButton';
import { User } from '@/types/User';
import { SearchUser } from '@/domain/UserSearchService';

interface ProfileStatsProps {
    sneakersCount: number;
    sneakers: Sneaker[];
    user: User | SearchUser;
    isOwnProfile: boolean;
    handleFollowToggle: () => Promise<void>;
    isFollowLoading: boolean;
}

export default function ProfileStats({ 
    sneakersCount, 
    sneakers, 
    user, 
    isOwnProfile, 
    handleFollowToggle, 
    isFollowLoading 
}: ProfileStatsProps) {
    const { t } = useTranslation();
    const { formattedPrice } = useCurrencyStore();

    const totalValue = sneakers?.reduce((acc, sneaker) => acc + (sneaker.estimated_value || 0), 0) || 0;

    const isFollowing = isOwnProfile ? false : ('is_following' in user ? user.is_following : false);
    const buttonColor = isFollowing ? 'bg-gray-300' : 'bg-primary';

    return (
        <View className="flex justify-center">
            <View className="flex-row gap-2">
                <View className="p-3 rounded-lg">
                    <Text className="font-open-sans-bold text-xl" testID='sneakers-count'>
                        {sneakersCount}
                    </Text>
                    <Text className="font-open-sans text-base">
                        {t('collection.stats.sneakers')}
                    </Text>
                </View>

                <View className="p-3 rounded-lg">
                    <Text className="font-open-sans-bold text-xl">
                        {user.followers_count}
                    </Text>
                    <Text className="font-open-sans text-base">
                        {t('social.followers')}
                    </Text>
                </View>

                <View className="p-3 rounded-lg">
                    <Text className="font-open-sans-bold text-xl">
                        {user.following_count}
                    </Text>
                    <Text className="font-open-sans text-base">
                        {t('social.following')}
                    </Text>
                </View>
            </View>

            <View className="p-3 rounded-lg">
                <Text className="font-open-sans-bold text-xl">
                    {formattedPrice(totalValue)}
                </Text>
                <Text className="font-open-sans text-base">
                    {t('ui.labels.value')}
                </Text>
            </View>

            {!isOwnProfile && (
                <FollowButton 
                    onPressAction={handleFollowToggle}
                    backgroundColor={buttonColor}
                    isDisabled={isFollowLoading}
                    testID='follow-button'
                    isFollowing={isFollowing}
                />
            )}

        </View>
    );
} 