import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import ViewToggleButton from '@/components/ui/buttons/ViewToggleButton';
import Title from '@/components/ui/text/Title';
import { useSession } from '@/contexts/authContext';
import { SearchUser } from '@/domain/UserSearchProvider';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';

import BackToSearchButton from '../search/BackToSearchButton';
import ProfileInfo from './ProfileInfo';
import SettingsButton from './SettingsButton';

interface ProfileHeaderProps {
	user: User | SearchUser;
	userSneakers: Sneaker[];
	showBackButton?: boolean;
}

export default function ProfileHeader({
	user,
	userSneakers,
	showBackButton = false,
}: ProfileHeaderProps) {
	const { t } = useTranslation();
	const { user: currentUser } = useSession();
	const isOwnProfile = user.id === currentUser?.id;

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
					<ViewToggleButton />
				</View>
			)}
		</View>
	);
}
