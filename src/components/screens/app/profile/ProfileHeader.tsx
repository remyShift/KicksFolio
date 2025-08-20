import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

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
	showBackButton?: boolean;
}

export default function ProfileHeader(props: ProfileHeaderProps) {
	const { user, showBackButton = false } = props;
	const { t } = useTranslation();
	const { user: currentUser } = useSession();
	const isOwnProfile = user.id === currentUser?.id;
	const { userSneakers } = useSession();

	return (
		<View className="flex gap-16 mb-8">
			<View className="flex gap-12">
				{showBackButton && <BackToSearchButton />}

				{isOwnProfile && <SettingsButton />}

				<ProfileInfo user={user} />
			</View>

			{userSneakers && userSneakers.length > 0 && (
				<View className="flex-row items-center">
					<Title content={t('collection.pages.titles.collection')} />
					<ToggleDisplayState />
				</View>
			)}
		</View>
	);
}
