import { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';

import { router } from 'expo-router';

import { SearchUser } from '@/domain/UserSearchProvider';

import UserActions from './UserActions';
import UserAvatar from './UserAvatar';
import UserInfo from './UserInfo';

interface UserListItemProps {
	searchUser: SearchUser;
	testID?: string;
}
export default function UserListItem({
	searchUser,
	testID,
}: UserListItemProps) {
	const handlePress = useCallback(() => {
		router.push(`/(app)/(tabs)/search/${searchUser.id}`);
	}, [searchUser.id]);

	return (
		<TouchableOpacity
			className="flex-row items-center p-4 bg-white"
			onPress={handlePress}
			testID={testID || `user-item-${searchUser.id}`}
		>
			<UserAvatar searchUser={searchUser} />
			<UserInfo searchUser={searchUser} />
			<UserActions searchUser={searchUser} />
		</TouchableOpacity>
	);
}
