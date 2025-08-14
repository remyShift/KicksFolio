import { useCallback } from 'react';

import { View } from 'react-native';

import { useModalContext } from '@/hooks/useModalContext';
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

	const handleSneakerPress = useCallback(
		(sneaker: Sneaker) => {
			// Utiliser onSneakerPress si fourni, sinon utiliser openSneakerModal
			if (onSneakerPress) {
				onSneakerPress(sneaker);
			} else {
				openSneakerModal(sneaker);
			}
		},
		[onSneakerPress, openSneakerModal]
	);

	return (
		<View className="flex-1">
			{isCardView ? (
				<View className="flex-1">
					<CardDisplay
						handleSneakerPress={handleSneakerPress}
						user={user}
						userSneakers={userSneakers}
					/>
				</View>
			) : (
				<View className="flex-1">
					<ListDisplay
						userSneakers={userSneakers}
						contextUserSneakers={userSneakers}
					/>
				</View>
			)}
		</View>
	);
}
