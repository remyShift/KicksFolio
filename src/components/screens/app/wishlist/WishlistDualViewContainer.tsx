import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';

import WishlistSneakerListFactory from './WishlistSneakerListFactory';

interface WishlistDualViewContainerProps {
	wishlistSneakers: Sneaker[];
	onSneakerPress?: (sneaker: Sneaker) => void;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
}

export default function WishlistDualViewContainer({
	wishlistSneakers,
	onSneakerPress,
	refreshing,
	onRefresh,
}: WishlistDualViewContainerProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { openSneakerModal } = useModalContext({
		contextSneakers: wishlistSneakers,
	});

	const isCardView = viewDisplayState === ViewDisplayState.Card;

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

	const validatedSneakers = useMemo(() => {
		return wishlistSneakers && Array.isArray(wishlistSneakers)
			? wishlistSneakers
			: [];
	}, [wishlistSneakers]);

	return (
		<View className="flex-1">
			{isCardView ? (
				<SneakersCardByBrand
					sneakers={validatedSneakers}
					onSneakerPress={handleSneakerPress}
					showOwnerInfo={true}
				/>
			) : (
				<WishlistSneakerListFactory
					sneakers={validatedSneakers}
					showOwnerInfo={true}
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			)}
		</View>
	);
}
