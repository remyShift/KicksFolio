import { Pressable } from 'react-native';
import { SearchUser } from '@/services/UserSearchService';
import UserActions from './UserActions';
import UserAvatar from './UserAvatar';
import UserInfo from './UserInfo';
import { router } from 'expo-router';

interface UserListItemProps {
    searchUser: SearchUser;
    testID?: string;
}
export default function UserListItem({ searchUser, testID }: UserListItemProps) {
    const handlePress = () => {
        router.push(`/(app)/user-profile/${searchUser.id}`);
    };

    return (
        <Pressable
            className="flex-row items-center p-4 bg-white mx-4 mb-3 rounded-lg shadow-sm"
            onPress={handlePress}
            testID={testID || `user-item-${searchUser.id}`}
        >
            <UserAvatar searchUser={searchUser} />
            <UserInfo searchUser={searchUser} />
            <UserActions searchUser={searchUser} />
        </Pressable>
    );
}
