import { useCallback, useMemo, useRef, useState } from 'react';

import { View } from 'react-native';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

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
	const swipeableRef = useRef<any>(null);
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
				<SneakerListItem
					key={item.id}
					sneaker={item}
					showOwnerInfo={showOwnerInfo}
				/>
			);
		},
		[showOwnerInfo]
	);

	const renderRightActions = useCallback(
		(item: Sneaker) => {
			return (
				<SwipeActions
					key={`actions-${item.id}`}
					sneaker={item}
					closeRow={handleCloseRow}
					userSneakers={userSneakers}
				/>
			);
		},
		[handleCloseRow, userSneakers]
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

	// Optimisations pour les grandes listes
	const getItemLayout = useCallback((data: any, index: number) => {
		const itemHeight = 100; // Hauteur approximative de chaque item
		return {
			length: itemHeight,
			offset: itemHeight * index,
			index,
		};
	}, []);

	return (
		<SwipeableFlatList
			key={listKey}
			ref={swipeableRef}
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			renderRightActions={renderRightActions}
			keyExtractor={keyExtractor}
			ListHeaderComponent={ListHeaderComponent}
			ItemSeparatorComponent={ItemSeparatorComponent}
			getItemLayout={getItemLayout}
			contentContainerStyle={{ paddingTop: 0, paddingBottom: 10 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={false}
			nestedScrollEnabled={false}
			keyboardShouldPersistTaps="handled"
			removeClippedSubviews={true}
			enableOpenMultipleRows={false}
			maxToRenderPerBatch={5}
			windowSize={5}
			initialNumToRender={5}
			updateCellsBatchingPeriod={100}
			onEndReachedThreshold={0.5}
			// Optimisations supplémentaires pour les animations
			disableVirtualization={false}
			disableIntervalMomentum={true}
			decelerationRate="fast"
		/>
	);
}
