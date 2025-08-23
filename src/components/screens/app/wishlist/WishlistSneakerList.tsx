import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';

import WishlistListItem from './WishlistListItem';

interface WishlistSneakerListProps {
	sneakers: Sneaker[];
	onSneakerPress?: (sneaker: Sneaker) => void;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
}

const ESTIMATED_ITEM_HEIGHT = 80;

export default function WishlistSneakerList({
	sneakers,
	onSneakerPress,
}: WishlistSneakerListProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { openSneakerModal } = useModalContext({
		contextSneakers: sneakers,
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
		return sneakers && Array.isArray(sneakers) ? sneakers : [];
	}, [sneakers]);

	const renderItem = useCallback(({ item }: { item: Sneaker }) => {
		return (
			<View className="bg-white border-b border-gray-100">
				<WishlistListItem sneaker={item} />
			</View>
		);
	}, []);

	const keyExtractor = useCallback((item: Sneaker) => {
		return item.id || Math.random().toString();
	}, []);

	if (isCardView) {
		return (
			<View className="flex-1">
				<SneakersCardByBrand
					sneakers={validatedSneakers}
					onSneakerPress={handleSneakerPress}
					showOwnerInfo={false}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1">
			<FlashList
				data={validatedSneakers}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
				contentContainerStyle={{ paddingTop: 0, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
				scrollEnabled={true}
				nestedScrollEnabled={true}
				indicatorStyle="black"
				keyboardShouldPersistTaps="handled"
			/>
		</View>
	);
}
