import { useCallback, useMemo } from 'react';

import { Text, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';

import WishlistSwipeableItem from './WishlistSwipeableItem';

interface WishlistSneakerListProps {
	sneakers: Sneaker[];
	onSneakerPress?: (sneaker: Sneaker) => void;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
}

export default function WishlistSneakerList({
	sneakers,
	onSneakerPress,
}: WishlistSneakerListProps) {
	const { viewDisplayState } = useViewDisplayStateStore();
	const { openSneakerModal } = useModalContext({
		contextSneakers: sneakers,
	});

	const isCardView = viewDisplayState === ViewDisplayState.Card;

	const { filteredAndSortedSneakers } = useLocalSneakerData(sneakers);

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
		return filteredAndSortedSneakers &&
			Array.isArray(filteredAndSortedSneakers)
			? filteredAndSortedSneakers
			: [];
	}, [filteredAndSortedSneakers]);

	const renderItem = useCallback(
		({ item }: { item: Sneaker }) => {
			return (
				<View className="bg-white border-b border-gray-100">
					<WishlistSwipeableItem
						sneaker={item}
						wishlistSneakers={validatedSneakers}
					/>
				</View>
			);
		},
		[validatedSneakers]
	);

	const ListHeaderComponent = useMemo(() => {
		if (isCardView) {
			return null;
		}

		return (
			<View className="py-2 bg-background border-b border-gray-200 mb-2">
				<View className="flex-row justify-between items-center mb-3 px-4">
					<Text className="text-lg font-semibold">
						{validatedSneakers.length} sneaker
						{validatedSneakers.length > 1 ? 's' : ''} en wishlist
					</Text>
				</View>
			</View>
		);
	}, [isCardView, validatedSneakers.length]);

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
				ListHeaderComponent={ListHeaderComponent}
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
