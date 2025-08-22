import { memo, useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { Sneaker } from '@/types/sneaker';

import ListControls from '../profile/displayState/list/ListControls';
import { useSneakerFiltering } from '../profile/hooks/useSneakerFiltering';
import WishlistSwipeItemList from './WishlistSwipeItemList';

interface WishlistSneakerListFactoryProps {
	sneakers: Sneaker[];
	showOwnerInfo?: boolean;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
}

const ESTIMATED_ITEM_HEIGHT = 80;

function WishlistSneakerListFactory({
	sneakers,
	showOwnerInfo = false,
	refreshing = false,
	onRefresh,
}: WishlistSneakerListFactoryProps) {
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
	} = useSneakerFiltering({ sneakers });

	const renderItem = useCallback(
		({ item, index }: { item: Sneaker; index: number }) => {
			const result = (
				<WishlistSwipeItemList
					item={item}
					showOwnerInfo={showOwnerInfo}
				/>
			);

			return result;
		},
		[showOwnerInfo]
	);

	const keyExtractor = useCallback((item: Sneaker) => {
		const key = item.id || Math.random().toString();
		return key;
	}, []);

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
				visibleSneakers={filteredAndSortedSneakers}
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
	]);

	return (
		<View className="flex-1">
			<FlashList
				data={filteredAndSortedSneakers}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ListHeaderComponent={ListHeaderComponent}
				onEndReachedThreshold={0.5}
				scrollEventThrottle={16}
				removeClippedSubviews={true}
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

export default memo(WishlistSneakerListFactory, (prevProps, nextProps) => {
	const propsChanged = {
		sneakers: prevProps.sneakers !== nextProps.sneakers,
		showOwnerInfo: prevProps.showOwnerInfo !== nextProps.showOwnerInfo,
		refreshing: prevProps.refreshing !== nextProps.refreshing,
		onRefresh: prevProps.onRefresh !== nextProps.onRefresh,
	};

	const hasChanges = Object.values(propsChanged).some(Boolean);

	return !hasChanges;
});
