import { useCallback, useRef, useState } from 'react';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import ListControls from './ListControls';
import SneakerListItem from './SneakerListItem';
import SwipeActions from './SwipeActions';

interface SneakersListViewProps {
	sneakers: Sneaker[];
	scrollEnabled?: boolean;
	showOwnerInfo?: boolean;
}

export default function SneakersListView({
	sneakers,
	scrollEnabled = true,
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
			<SneakerListItem sneaker={item} showOwnerInfo={showOwnerInfo} />
		),
		[showOwnerInfo]
	);

	const renderRightActions = useCallback((item: Sneaker) => {
		return (
			<SwipeActions
				sneaker={item}
				closeRow={() => {
					setListKey((prev) => prev + 1);
				}}
			/>
		);
	}, []);

	const renderListHeader = useCallback(
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
			sneakers,
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

	return (
		<SwipeableFlatList
			key={listKey}
			ref={swipeableRef}
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			renderRightActions={renderRightActions}
			keyExtractor={(item) => item.id}
			ListHeaderComponent={renderListHeader}
			contentContainerStyle={{ paddingTop: 0 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={scrollEnabled}
			nestedScrollEnabled={!scrollEnabled}
			keyboardShouldPersistTaps="handled"
			removeClippedSubviews={false}
			enableOpenMultipleRows={false}
		/>
	);
}
