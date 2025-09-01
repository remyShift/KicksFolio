import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';

import ListControls from '../profile/displayState/list/ListControls';
import WishlistSwipeableItem from './WishlistSwipeableItem';

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

	const {
		filteredAndSortedSneakers,
		uniqueValues,
		sortBy,
		sortOrder,
		showFilters,
		filters,
		toggleSort,
		toggleFilters,
		updateFilter,
		clearFilters,
	} = useLocalSneakerData(sneakers);

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
		return (
			<ListControls
				uniqueValues={uniqueValues}
				sortBy={sortBy}
				sortOrder={sortOrder}
				showFilters={showFilters}
				filters={filters}
				onToggleSort={toggleSort}
				onToggleFilters={toggleFilters}
				onUpdateFilter={updateFilter}
				onClearFilters={clearFilters}
				filteredAndSortedSneakers={filteredAndSortedSneakers}
				visibleSneakers={validatedSneakers}
			/>
		);
	}, [
		uniqueValues,
		sortBy,
		sortOrder,
		showFilters,
		filters,
		toggleSort,
		toggleFilters,
		updateFilter,
		clearFilters,
		filteredAndSortedSneakers,
		validatedSneakers,
	]);

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
