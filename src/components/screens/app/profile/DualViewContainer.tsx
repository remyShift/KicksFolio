import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { useModalStore } from '@/store/useModalStore';
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
}

export default function DualViewContainer({
	user,
	userSneakers,
}: DualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { setCurrentSneaker, setModalStep, setIsVisible } = useModalStore();

	const isCardView = viewDisplayState === ViewDisplayState.Card;

	const handleSneakerPress = useCallback(
		(sneaker: Sneaker) => {
			setCurrentSneaker(sneaker);
			setModalStep('view');
			setIsVisible(true);
		},
		[setCurrentSneaker, setModalStep, setIsVisible]
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
		() => <ListDisplay userSneakers={userSneakers} />,
		[userSneakers]
	);

	return (
		<View className="flex-1">
			<View
				style={{
					display: isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				{cardDisplay}
			</View>
			<View
				style={{
					display: !isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				{listDisplay}
			</View>
		</View>
	);
}
