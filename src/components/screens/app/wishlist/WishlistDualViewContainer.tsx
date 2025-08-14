import { useMemo } from 'react';

import { View } from 'react-native';

import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';

import WishlistSneakersListView from './WishlistSneakersListView';

interface WishlistDualViewContainerProps {
	wishlistSneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
}

export default function WishlistDualViewContainer({
	wishlistSneakers,
	onSneakerPress,
}: WishlistDualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();

	const isCardView = viewDisplayState === ViewDisplayState.Card;

	const cardView = useMemo(
		() => (
			<SneakersCardByBrand
				sneakers={wishlistSneakers}
				onSneakerPress={onSneakerPress}
				showOwnerInfo={true}
			/>
		),
		[wishlistSneakers, onSneakerPress]
	);

	const listView = useMemo(
		() => (
			<WishlistSneakersListView
				sneakers={wishlistSneakers}
				onSneakerPress={onSneakerPress}
				scrollEnabled={false}
				showOwnerInfo={true}
			/>
		),
		[wishlistSneakers, onSneakerPress]
	);

	return (
		<View className="flex-1 gap-8">
			<View
				testID="card-view-container"
				style={{
					display: isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				{cardView}
			</View>

			<View
				style={{
					display: !isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				{listView}
			</View>
		</View>
	);
}
