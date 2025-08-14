import { View } from 'react-native';

import { Sneaker } from '@/types/sneaker';
import { SearchUser } from '@/types/user';
import { User } from '@/types/user';

import SneakersCardByBrand from './SneakersCardByBrand';

interface CardDisplayProps {
	handleSneakerPress: (sneaker: Sneaker) => void;
	user: User | SearchUser;
	userSneakers: Sneaker[];
}

export default function CardDisplay(props: CardDisplayProps) {
	if (!props || typeof props !== 'object') {
		console.error('CardDisplay: Props sont null ou invalides:', props);
		return null;
	}

	const { handleSneakerPress, user, userSneakers } = props;
	return (
		<View className="flex-1">
			<SneakersCardByBrand
				sneakers={userSneakers}
				onSneakerPress={handleSneakerPress}
			/>
		</View>
	);
}
