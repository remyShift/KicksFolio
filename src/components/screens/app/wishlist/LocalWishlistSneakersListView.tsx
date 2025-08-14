import { useCallback } from 'react';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import LocalListControls from '../profile/displayState/list/ListControls';
import SneakerListItem from '../profile/displayState/list/SneakerListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

interface LocalWishlistSneakersListViewProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	scrollEnabled?: boolean;
	showOwnerInfo?: boolean;
}

export default function LocalWishlistSneakersListView({
	sneakers,
	onSneakerPress,
	scrollEnabled = true,
	showOwnerInfo = false,
}: LocalWishlistSneakersListViewProps) {
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
				sneaker={item}
				onPress={onSneakerPress}
				showOwnerInfo={showOwnerInfo}
			/>
		),
		[onSneakerPress, showOwnerInfo]
	);

	const renderRightActions = useCallback((item: Sneaker) => {
		return <WishlistSwipeActions sneaker={item} />;
	}, []);

	const renderListHeader = useCallback(
		() => (
			<LocalListControls
				sneakers={sneakers}
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
