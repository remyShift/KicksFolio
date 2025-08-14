import { useCallback, useMemo, useRef, useState } from 'react';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import ListControls from './ListControls';
import SneakerListItem from './SneakerListItem';
import SwipeActions from './SwipeActions';

interface SneakersListViewProps {
	sneakers: Sneaker[];
	showOwnerInfo?: boolean;
}

export default function SneakersListView({
	sneakers,
	showOwnerInfo = false,
}: SneakersListViewProps) {
	const swipeableRef = useRef<any>(null);
	const [listKey, setListKey] = useState(0);

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
			<SwipeActions
				key={`actions-${item.id}`}
				sneaker={item}
				closeRow={() => {
					setListKey((prev) => prev + 1);
				}}
			/>
		);
	}, []);

	const ListHeaderComponent = useMemo(
		() => (
			<ListControls
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
			key={listKey}
			ref={swipeableRef}
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			renderRightActions={renderRightActions}
			keyExtractor={keyExtractor}
			ListHeaderComponent={ListHeaderComponent}
			contentContainerStyle={{ paddingTop: 0 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={false}
			nestedScrollEnabled={false}
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
