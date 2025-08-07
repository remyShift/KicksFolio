import { useMemo } from 'react';

import { View } from 'react-native';

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
	onSneakerPress: (sneaker: Sneaker) => void;
	showBackButton?: boolean;
}

export default function DualViewContainer({
	user,
	userSneakers,
	refreshing,
	onRefresh,
	onSneakerPress,
	showBackButton = false,
}: DualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();

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

	return (
		<View className="flex-1">
			<View
				style={{
					display: isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				<CardDisplay
					sneakersByBrand={sneakersByBrand}
					handleSneakerPress={onSneakerPress}
					refreshing={refreshing}
					onRefresh={onRefresh}
					user={user}
					userSneakers={userSneakers}
					showBackButton={showBackButton}
				/>
			</View>

			<View
				style={{
					display: !isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				<ListDisplay
					userSneakers={userSneakers}
					handleSneakerPress={onSneakerPress}
					refreshing={refreshing}
					onRefresh={onRefresh}
					user={user}
					showBackButton={showBackButton}
				/>
			</View>
		</View>
	);
}
