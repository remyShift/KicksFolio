import { memo, useMemo } from 'react';

import { Text, View } from 'react-native';

import { useSession } from '@/contexts/authContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SearchUser, User } from '@/types/user';

import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import SocialMediaLinks from './SocialMediaLinks';

export interface ProfileInfoProps {
	user: User | SearchUser;
	isAnonymousUser?: boolean;
}

function ProfileInfo(props: ProfileInfoProps) {
	const { user, isAnonymousUser = false } = props;
	const { user: currentUser, userSneakers } = useSession();

	const { userProfile, handleFollowToggle, isFollowLoading } = useUserProfile(
		user.id
	);

	const isOwnProfile = useMemo(
		() => currentUser?.id === user.id,
		[currentUser?.id, user.id]
	);

	const displayUser = useMemo(
		() => (isOwnProfile ? user : userProfile?.userSearch),
		[isOwnProfile, user, userProfile?.userSearch]
	);

	const displaySneakers = useMemo(
		() => (isOwnProfile ? userSneakers || [] : userProfile?.sneakers || []),
		[isOwnProfile, userSneakers, userProfile?.sneakers]
	);

	const shouldRender = useMemo(() => {
		if (!user) return false;
		if (!isOwnProfile && !userProfile) return false;
		if (!displayUser) return false;
		return true;
	}, [user, isOwnProfile, userProfile, displayUser]);

	if (!shouldRender || !displayUser) return null;

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
				isAnonymousUser={isAnonymousUser}
			/>
		</View>
	);
}

export default memo(ProfileInfo, (prevProps, nextProps) => {
	return (
		prevProps.user.id === nextProps.user.id &&
		prevProps.user.username === nextProps.user.username &&
		prevProps.user.profile_picture === nextProps.user.profile_picture &&
		prevProps.user.followers_count === nextProps.user.followers_count &&
		prevProps.user.following_count === nextProps.user.following_count &&
		prevProps.isAnonymousUser === nextProps.isAnonymousUser
	);
});
