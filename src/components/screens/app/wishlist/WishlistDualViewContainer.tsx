import { useMemo } from 'react';

import { View } from 'react-native';

import LocalSneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
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

	return (
		<View className="flex-1 gap-8">
			<View
				testID="card-view-container"
				style={{
					display: isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				<LocalSneakersCardByBrand
					sneakers={wishlistSneakers}
					onSneakerPress={onSneakerPress}
					showOwnerInfo={true}
				/>
			</View>

			<View
				style={{
					display: !isCardView ? 'flex' : 'none',
					flex: 1,
				}}
			>
				<WishlistSneakersListView
					sneakers={wishlistSneakers}
					onSneakerPress={onSneakerPress}
					scrollEnabled={false}
					showOwnerInfo={true}
				/>
			</View>
		</View>
	);
}
