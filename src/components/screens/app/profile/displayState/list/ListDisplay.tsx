import { View } from 'react-native';

import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

import SneakersListView from './SneakersListView';

interface ListDisplayProps {
	userSneakers: Sneaker[];
	handleSneakerPress: (sneaker: Sneaker) => void;
	user: User | SearchUser;
}

export default function ListDisplay(props: ListDisplayProps) {
	if (!props || typeof props !== 'object') {
		console.error('ListDisplay: Props sont null ou invalides:', props);
		return null;
	}

	const { userSneakers, handleSneakerPress, user } = props;
	return (
		<View className="flex-1">
			<SneakersListView
				sneakers={userSneakers}
				onSneakerPress={handleSneakerPress}
				scrollEnabled={false}
			/>
		</View>
	);
}
