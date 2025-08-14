import { useCallback } from 'react';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import ListControls from '../profile/displayState/list/ListControls';
import SneakerListItem from '../profile/displayState/list/SneakerListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

interface WishlistSneakersListViewProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
}

export default function WishlistSneakersListView({
	sneakers,
	onSneakerPress,
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
		({ item }: { item: Sneaker }) => {
			return (
				<SneakerListItem sneaker={item} showOwnerInfo={showOwnerInfo} />
			);
		},
		[onSneakerPress, showOwnerInfo]
	);

	const renderRightActions = useCallback((item: Sneaker) => {
		return <WishlistSwipeActions sneaker={item} />;
	}, []);

	const renderListHeader = useCallback(() => {
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
	]);

	return (
		<SwipeableFlatList
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			renderRightActions={renderRightActions}
			keyExtractor={(item) => item.id}
			ListHeaderComponent={renderListHeader}
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
