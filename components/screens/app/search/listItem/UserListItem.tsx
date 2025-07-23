import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SearchUser } from '@/services/UserSearchService';
import UserActions from './UserActions';
import UserAvatar from './UserAvatar';
import UserInfo from './UserInfo';

interface UserListItemProps {
    searchUser: SearchUser;
    onPress: (userId: string) => void;
    testID?: string;
}

export default function UserListItem({ searchUser, onPress, testID }: UserListItemProps) {
    const { t } = useTranslation();

    const handlePress = () => {
        onPress(searchUser.id);
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
