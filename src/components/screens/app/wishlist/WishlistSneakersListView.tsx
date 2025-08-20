import { useCallback, useState } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { useSneakerFiltering } from '@/components/screens/app/profile/displayState/list/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import ListControls from '../profile/displayState/list/ListControls';
import WishlistSwipeItemList from './WishlistSwipeItemList';

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

	const handleCloseRow = useCallback(() => {
		setListKey((prev) => prev + 1);
	}, []);

	const renderSneakerItem = useCallback(
		({ item }: { item: Sneaker }) => {
			return (
				<WishlistSwipeItemList
					item={item}
					showOwnerInfo={showOwnerInfo}
					onCloseRow={handleCloseRow}
				/>
			);
		},
		[handleCloseRow, showOwnerInfo]
	);

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
		<FlashList
			key={listKey}
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			keyExtractor={(item) => item.id}
			ListHeaderComponent={renderListHeader}
			contentContainerStyle={{ paddingTop: 0, paddingBottom: 10 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={true}
			nestedScrollEnabled={true}
			keyboardShouldPersistTaps="handled"
			estimatedItemSize={100}
			removeClippedSubviews={true}
			maxToRenderPerBatch={5}
			windowSize={5}
			initialNumToRender={10}
			onEndReachedThreshold={0.5}
			maintainVisibleContentPosition={{
				minIndexForVisible: 0,
				autoscrollToTopThreshold: 10,
			}}
		/>
	);
}
