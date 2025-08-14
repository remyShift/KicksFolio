import { View } from 'react-native';

import { Sneaker } from '@/types/sneaker';

import SneakersListView from './SneakersListView';

interface ListDisplayProps {
	userSneakers: Sneaker[];
}

export default function ListDisplay(props: ListDisplayProps) {
	if (!props || typeof props !== 'object') {
		console.error('ListDisplay: Props sont null ou invalides:', props);
		return null;
	}

	const { userSneakers } = props;
	return (
		<View className="flex-1">
			<SneakersListView sneakers={userSneakers} />
		</View>
	);
}
