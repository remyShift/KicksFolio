import { useMemo } from 'react';

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
	// Optimisation : validation des props avec useMemo
	const validatedProps = useMemo(() => {
		if (!props || typeof props !== 'object') {
			console.error('CardDisplay: Props sont null ou invalides:', props);
			return null;
		}

		const { handleSneakerPress, user, userSneakers } = props;

		// Validation des données
		if (!Array.isArray(userSneakers)) {
			console.error(
				'CardDisplay: userSneakers doit être un tableau:',
				userSneakers
			);
			return null;
		}

		return {
			handleSneakerPress,
			user,
			userSneakers,
		};
	}, [props]);

	// Rendu conditionnel basé sur la validation
	if (!validatedProps) {
		return (
			<View className="flex-1 justify-center items-center">
				<View className="h-1" />
			</View>
		);
	}

	const { handleSneakerPress, user, userSneakers } = validatedProps;

	// Optimisation : mémorisation du composant SneakersCardByBrand
	// Le hook useLocalSneakerData ne sera exécuté que quand ce composant est rendu
	const sneakersCardComponent = useMemo(() => {
		return (
			<SneakersCardByBrand
				sneakers={userSneakers}
				onSneakerPress={handleSneakerPress}
			/>
		);
	}, [userSneakers, handleSneakerPress]);

	return <View className="flex-1">{sneakersCardComponent}</View>;
}
