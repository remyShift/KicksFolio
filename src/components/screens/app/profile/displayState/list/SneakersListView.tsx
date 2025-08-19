import { useCallback, useMemo, useState } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { useSwipeOptimization } from '@/hooks/useSwipeOptimization';
import { Sneaker } from '@/types/sneaker';

import ListControls from './ListControls';
import SneakerListItem from './SneakerListItem';
import SwipeActions from './SwipeActions';

interface SneakersListViewProps {
	sneakers: Sneaker[];
	showOwnerInfo?: boolean;
	userSneakers?: Sneaker[];
}

export default function SneakersListView({
	sneakers,
	showOwnerInfo = false,
	userSneakers,
}: SneakersListViewProps) {
	const [listKey, setListKey] = useState(0);
	const { closeRow, clearOpenRow } = useSwipeOptimization();

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
		closeRow();
		setListKey((prev) => prev + 1);
	}, [closeRow]);

	const renderSneakerItem = useCallback(
		({ item }: { item: Sneaker }) => {
			return (
				<View className="relative">
					<SneakerListItem
						key={item.id}
						sneaker={item}
						showOwnerInfo={showOwnerInfo}
					/>
					<View className="absolute right-0 top-0 bottom-0 flex-row">
						<SwipeActions
							sneaker={item}
							closeRow={handleCloseRow}
							userSneakers={userSneakers}
						/>
					</View>
				</View>
			);
		},
		[handleCloseRow, showOwnerInfo, userSneakers]
	);

	const ListHeaderComponent = useMemo(() => {
		return (
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
		);
	}, [
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
	]);

	const keyExtractor = useCallback((item: Sneaker) => {
		return item.id;
	}, []);

	const ItemSeparatorComponent = useCallback(() => {
		return <View className="h-1" />;
	}, []);

	// FlashList v2 does not require item size estimates

	return (
		<FlashList
			key={listKey}
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			keyExtractor={keyExtractor}
			ListHeaderComponent={ListHeaderComponent}
			ItemSeparatorComponent={ItemSeparatorComponent}
			contentContainerStyle={{ paddingTop: 0, paddingBottom: 10 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={false}
			nestedScrollEnabled={false}
			keyboardShouldPersistTaps="handled"
		/>
	);
}
