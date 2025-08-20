import { useCallback, useMemo } from 'react';

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

	const cardDisplay = useMemo(
		() => (
			<CardDisplay
				handleSneakerPress={handleSneakerPress}
				user={user}
				userSneakers={userSneakers}
			/>
		),
		[handleSneakerPress, user, userSneakers]
	);

	const listDisplay = useMemo(
		() => (
			<ListDisplay
				userSneakers={userSneakers}
				contextUserSneakers={userSneakers}
			/>
		),
		[userSneakers]
	);

	return (
		<View className="flex-1">{isCardView ? cardDisplay : listDisplay}</View>
	);
}
