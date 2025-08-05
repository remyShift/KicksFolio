import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { SearchUser } from '@/domain/UserSearchProvider';

interface UserActionsProps {
	searchUser: SearchUser;
}

export default function UserActions({ searchUser }: UserActionsProps) {
	const { t } = useTranslation();

	return (
		<View className="items-center">
			<Feather name="chevron-right" size={20} color="#666" />
		</View>
	);
}
