import { useCallback } from 'react';

import { View } from 'react-native';

import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';
import { SearchUser } from '@/types/user';
import { User } from '@/types/user';

import CardDisplay from './displayState/card/CardDisplay';
import ListDisplay from './displayState/list/ListDisplay';

interface DualViewContainerProps {
	user: User | SearchUser;
	userSneakers: Sneaker[];
	onSneakerPress?: (sneaker: Sneaker) => void;
}

export default function DualViewContainer({
	user,
	userSneakers,
	onSneakerPress,
}: DualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { openSneakerModal } = useModalContext({
		contextSneakers: userSneakers,
	});

	const isCardView = viewDisplayState === ViewDisplayState.Card;

	// Optimisation : mémorisation du handleSneakerPress
	const handleSneakerPress = useCallback(
		(sneaker: Sneaker) => {
			if (onSneakerPress) {
				onSneakerPress(sneaker);
			} else {
				openSneakerModal(sneaker);
			}
		},
		[onSneakerPress, openSneakerModal]
	);

	// Rendu conditionnel pur - React ne rend que le composant nécessaire
	return (
		<View className="flex-1">
			{isCardView ? (
				<CardDisplay
					handleSneakerPress={handleSneakerPress}
					user={user}
					userSneakers={userSneakers}
				/>
			) : (
				<ListDisplay
					userSneakers={userSneakers}
					contextUserSneakers={userSneakers}
				/>
			)}
		</View>
	);
}
