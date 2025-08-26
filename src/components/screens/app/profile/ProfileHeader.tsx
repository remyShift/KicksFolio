import { memo, useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import ShareButton from '@/components/ui/buttons/ShareButton';
import ToggleDisplayState from '@/components/ui/buttons/ToggleDisplayState';
import Title from '@/components/ui/text/Title';
import { useSession } from '@/contexts/authContext';
import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

import BackToSearchButton from '../search/BackToSearchButton';
import ProfileInfo from './ProfileInfo';
import SettingsButton from './SettingsButton';

interface ProfileHeaderProps {
	user: User | SearchUser;
	userSneakers?: Sneaker[];
	showBackButton?: boolean;
	onSharePress?: () => void;
}

function ProfileHeader(props: ProfileHeaderProps) {
	const {
		user,
		userSneakers = [],
		showBackButton = false,
		onSharePress,
	} = props;
	const { t } = useTranslation();
	const { user: currentUser } = useSession();

	const isOwnProfile = useMemo(
		() => user.id === currentUser?.id,
		[user.id, currentUser?.id]
	);

	const backButton = useMemo(
		() => (showBackButton ? <BackToSearchButton /> : null),
		[showBackButton]
	);

	const settingsButton = useMemo(
		() => (isOwnProfile ? <SettingsButton /> : null),
		[isOwnProfile]
	);

	const hasSneakers = useMemo(
		() => userSneakers.length > 0,
		[userSneakers.length]
	);

	const shareButton = useMemo(
		() =>
			isOwnProfile && hasSneakers && onSharePress ? (
				<ShareButton onPress={onSharePress} />
			) : null,
		[isOwnProfile, hasSneakers, onSharePress]
	);

	const collectionTitle = useMemo(
		() =>
			hasSneakers ? (
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Title
							content={t('collection.pages.titles.collection')}
						/>
						<ToggleDisplayState />
						{shareButton}
					</View>
				</View>
			) : null,
		[hasSneakers, t, shareButton]
	);

	const profileInfo = useMemo(
		() => <ProfileInfo user={user} />,
		[
			user.id,
			user.username,
			user.profile_picture,
			user.followers_count,
			user.following_count,
		]
	);

	return (
		<View className="flex gap-16 mb-8">
			<View className="flex gap-12">
				{backButton}
				{settingsButton}
				{profileInfo}
			</View>
			{collectionTitle}
		</View>
	);
}

export default memo(ProfileHeader, (prevProps, nextProps) => {
	return (
		prevProps.user.id === nextProps.user.id &&
		prevProps.user.username === nextProps.user.username &&
		prevProps.showBackButton === nextProps.showBackButton &&
		prevProps.userSneakers?.length === nextProps.userSneakers?.length
	);
});
