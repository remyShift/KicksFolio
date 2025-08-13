import { useMemo } from 'react';

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
	refreshing: boolean;
	onRefresh: () => Promise<void>;
	showBackButton?: boolean;
}

export default function DualViewContainer({
	user,
	userSneakers,
	refreshing,
	onRefresh,
	showBackButton = false,
}: DualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { setCurrentSneaker, setModalStep, setIsVisible } = useModalStore();

	const sneakersByBrand = useMemo(() => {
		if (!userSneakers || userSneakers.length === 0) return {};

		return userSneakers.reduce(
			(acc, sneaker) => {
				const normalizedBrand = sneaker.brand.toLowerCase().trim();

				if (!acc[normalizedBrand]) {
					acc[normalizedBrand] = [];
				}
				acc[normalizedBrand].push(sneaker);
				return acc;
			},
			{} as Record<string, Sneaker[]>
		);
	}, [userSneakers]);

	const isCardView = viewDisplayState === ViewDisplayState.Card;

	const handleSneakerPress = (sneaker: Sneaker) => {
		setCurrentSneaker(sneaker);
		setModalStep('view');
		setIsVisible(true);
	};

	return (
		<View className="flex-1">
			{isCardView ? (
				<CardDisplay
					sneakersByBrand={sneakersByBrand}
					handleSneakerPress={handleSneakerPress}
					refreshing={refreshing}
					onRefresh={onRefresh}
					user={user}
					userSneakers={userSneakers}
					showBackButton={showBackButton}
				/>
			) : (
				<ListDisplay
					userSneakers={userSneakers}
					handleSneakerPress={handleSneakerPress}
					refreshing={refreshing}
					onRefresh={onRefresh}
					user={user}
					showBackButton={showBackButton}
				/>
			)}
		</View>
	);
}
