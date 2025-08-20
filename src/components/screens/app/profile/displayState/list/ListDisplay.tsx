import { useMemo } from 'react';

import { View } from 'react-native';

import { Sneaker } from '@/types/sneaker';

import SneakersListView from './SneakersListView';

interface ListDisplayProps {
	userSneakers: Sneaker[];
	contextUserSneakers?: Sneaker[];
}

export default function ListDisplay(props: ListDisplayProps) {
	// Optimisation : validation des props avec useMemo
	const validatedProps = useMemo(() => {
		if (!props || typeof props !== 'object') {
			console.error('ListDisplay: Props sont null ou invalides:', props);
			return null;
		}

		const { userSneakers, contextUserSneakers } = props;

		// Validation des données
		if (!Array.isArray(userSneakers)) {
			console.error(
				'ListDisplay: userSneakers doit être un tableau:',
				userSneakers
			);
			return null;
		}

		return {
			userSneakers,
			contextUserSneakers: Array.isArray(contextUserSneakers)
				? contextUserSneakers
				: userSneakers,
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

	const { userSneakers, contextUserSneakers } = validatedProps;

	return (
		<View className="flex-1">
			<SneakersListView
				sneakers={userSneakers}
				userSneakers={contextUserSneakers}
			/>
		</View>
	);
}
