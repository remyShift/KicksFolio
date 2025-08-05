import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { SearchUser } from '@/src/domain/UserSearchProvider';

interface UserInfoProps {
	searchUser: SearchUser;
}

export default function UserInfo({ searchUser }: UserInfoProps) {
	const { t } = useTranslation();

	return (
		<View className="flex-1">
			<View className="flex-row items-center gap-2">
				<Text className="font-open-sans-bold text-lg text-gray-900">
					{searchUser.username}
				</Text>
				{searchUser.is_following && (
					<View className="bg-primary/10 px-2 py-1 rounded-full">
						<Text className="font-open-sans-bold text-xs text-primary">
							{t('social.following')}
						</Text>
					</View>
				)}
			</View>
			<Text className="font-open-sans text-sm text-gray-600">
				{searchUser.first_name} {searchUser.last_name}
			</Text>
			<View className="flex-row gap-2">
				<Text className="font-open-sans text-xs text-gray-500">
					{searchUser.followers_count} {t('social.followers')}
				</Text>
				<Text className="font-open-sans text-xs text-gray-500">
					{searchUser.following_count} {t('social.following')}
				</Text>
			</View>
		</View>
	);
}
