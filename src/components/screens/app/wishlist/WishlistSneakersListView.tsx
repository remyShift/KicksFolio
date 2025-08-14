import { useCallback, useMemo } from 'react';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import LocalListControls from '../profile/displayState/list/ListControls';
import SneakerListItem from '../profile/displayState/list/SneakerListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

interface WishlistSneakersListViewProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	scrollEnabled?: boolean;
	showOwnerInfo?: boolean;
}

export default function WishlistSneakersListView({
	sneakers,
	onSneakerPress,
	scrollEnabled = true,
	showOwnerInfo = false,
}: WishlistSneakersListViewProps) {
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

	const renderSneakerItem = useCallback(
		({ item }: { item: Sneaker }) => (
			<SneakerListItem
				key={item.id}
				sneaker={item}
				showOwnerInfo={showOwnerInfo}
			/>
		),
		[showOwnerInfo]
	);

	const renderRightActions = useCallback((item: Sneaker) => {
		return (
			<WishlistSwipeActions
				key={`wishlist-actions-${item.id}`}
				sneaker={item}
			/>
		);
	}, []);

	// Mémoriser le ListHeaderComponent
	const ListHeaderComponent = useMemo(
		() => (
			<LocalListControls
				filteredAndSortedSneakers={filteredAndSortedSneakers}
				uniqueValues={uniqueValues}
				sortBy={sortBy}
				sortOrder={sortOrder}
				showFilters={showFilters}
				filters={filters}
				onToggleSort={toggleSort}
				onToggleFilters={toggleFilters}
				onUpdateFilter={updateFilter}
				onClearFilters={clearFilters}
			/>
		),
		[
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
		]
	);

	const keyExtractor = useCallback((item: Sneaker) => item.id, []);

	return (
		<SwipeableFlatList
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			renderRightActions={renderRightActions}
			keyExtractor={keyExtractor}
			ListHeaderComponent={ListHeaderComponent}
			contentContainerStyle={{ paddingTop: 0 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={scrollEnabled}
			nestedScrollEnabled={!scrollEnabled}
			keyboardShouldPersistTaps="handled"
			removeClippedSubviews={true}
			enableOpenMultipleRows={false}
			maxToRenderPerBatch={10}
			windowSize={10}
			initialNumToRender={10}
			updateCellsBatchingPeriod={50}
			onEndReachedThreshold={0.5}
		/>
	);
}
