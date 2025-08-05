import { Text, View } from 'react-native';

import { useSession } from '@/contexts/authContext';
import { SearchUser } from '@/domain/UserSearchProvider';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User } from '@/types/user';

import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import SocialMediaLinks from './SocialMediaLinks';

export interface ProfileInfoProps {
	user: User | SearchUser;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
	const { user: currentUser, userSneakers } = useSession();

	const { userProfile, handleFollowToggle, isFollowLoading } = useUserProfile(
		user.id
	);

	if (!user) return null;

	const isOwnProfile = currentUser?.id === user.id;

	if (!isOwnProfile && !userProfile) {
		return null;
	}

	const displayUser = isOwnProfile ? user : userProfile?.userSearch;
	const displaySneakers = isOwnProfile
		? userSneakers || []
		: userProfile?.sneakers || [];

	if (!displayUser) {
		return null;
	}

	return (
		<View
			className="flex flex-row gap-4 items-center justify-center"
			testID="profile-info"
		>
			<View className="flex-col items-center justify-center">
				<ProfileAvatar
					profilePictureUrl={displayUser.profile_picture || null}
				/>

				<View className="flex gap-1">
					<Text className="font-open-sans text-base text-primary text-center">
						@{displayUser.username}
					</Text>
					<SocialMediaLinks
						user={displayUser}
						isOwnProfile={isOwnProfile}
					/>
				</View>
			</View>

			<ProfileStats
				sneakersCount={displaySneakers.length}
				sneakers={displaySneakers}
				user={displayUser}
				isOwnProfile={isOwnProfile}
				handleFollowToggle={handleFollowToggle}
				isFollowLoading={isFollowLoading}
			/>
		</View>
	);
}
