import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import FollowButton from '@/components/ui/buttons/FollowButton';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

interface ProfileStatsProps {
	sneakersCount: number;
	sneakers: Sneaker[];
	user: User | SearchUser;
	isOwnProfile: boolean;
	handleFollowToggle?: () => Promise<void>;
	isFollowLoading: boolean;
}

export default function ProfileStats(props: ProfileStatsProps) {
	const {
		sneakersCount = 0,
		sneakers = [],
		user,
		isOwnProfile = false,
		handleFollowToggle,
		isFollowLoading = false,
	} = props;
	const { t } = useTranslation();
	const { convertAndFormatdPrice } = useCurrencyStore();

	if (!user) {
		return null;
	}

	const totalValue =
		sneakers?.reduce(
			(acc, sneaker) => acc + (sneaker.estimated_value || 0),
			0
		) || 0;

	const isFollowing = isOwnProfile
		? false
		: 'is_following' in user
			? user.is_following
			: false;
	const buttonColor = isFollowing ? 'bg-gray-300' : 'bg-primary';

	return (
		<View className="flex justify-center">
			<View className="flex-row gap-2">
				<View className="p-3 rounded-lg">
					<Text
						className="font-open-sans-bold text-xl"
						testID="sneakers-count"
					>
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
					{convertAndFormatdPrice(totalValue)}
				</Text>
				<Text className="font-open-sans text-base">
					{t('ui.labels.value')}
				</Text>
			</View>

			{!isOwnProfile && handleFollowToggle && (
				<FollowButton
					onPressAction={handleFollowToggle}
					backgroundColor={buttonColor}
					isDisabled={isFollowLoading}
					testID="follow-button"
					isFollowing={isFollowing}
				/>
			)}
		</View>
	);
}
