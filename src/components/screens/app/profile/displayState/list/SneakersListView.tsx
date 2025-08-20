import { useCallback, useMemo, useRef, useState } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { useSwipeOptimization } from '@/hooks/useSwipeOptimization';
import { Sneaker } from '@/types/sneaker';

import ListControls from './ListControls';
import SneakerSwipeItemList from './SneakerSwipeItemList';

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

	// Optimisation : vérification de la validité des données
	const validSneakers = useMemo(() => {
		return Array.isArray(sneakers) ? sneakers : [];
	}, [sneakers]);

	// Optimisation : référence pour éviter les re-créations
	const sneakersRef = useRef(validSneakers);
	if (sneakersRef.current !== validSneakers) {
		sneakersRef.current = validSneakers;
	}

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
		isPending,
	} = useSneakerFiltering({ sneakers: sneakersRef.current });

	const handleCloseRow = useCallback(() => {
		closeRow();
		setListKey((prev) => prev + 1);
	}, [closeRow]);

	const renderSneakerItem = useCallback(
		({ item }: { item: Sneaker }) => {
			return (
				<SneakerSwipeItemList
					item={item}
					showOwnerInfo={showOwnerInfo}
					userSneakers={userSneakers}
					onCloseRow={handleCloseRow}
				/>
			);
		},
		[handleCloseRow, showOwnerInfo, userSneakers]
	);

	// Optimisation : mémorisation du ListHeaderComponent
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
				isPending={isPending}
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
		isPending,
	]);

	// Optimisation : mémorisation du keyExtractor
	const keyExtractor = useCallback((item: Sneaker) => {
		return item.id || Math.random().toString();
	}, []);

	// Optimisation : mémorisation du ItemSeparatorComponent
	const ItemSeparatorComponent = useCallback(() => {
		return <View className="h-1" />;
	}, []);

	// Optimisation : vérification de la validité des données avant le rendu
	if (!Array.isArray(filteredAndSortedSneakers)) {
		return (
			<View className="flex-1 justify-center items-center">
				<View className="h-1" />
			</View>
		);
	}

	// Optimisation : calcul de la taille estimée basée sur le nombre d'éléments
	const estimatedItemSize = useMemo(() => {
		const itemCount = filteredAndSortedSneakers.length;
		if (itemCount === 0) return 100;
		if (itemCount < 10) return 120;
		if (itemCount < 50) return 110;
		return 100;
	}, [filteredAndSortedSneakers.length]);

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
			scrollEnabled={true}
			nestedScrollEnabled={true}
			indicatorStyle="black"
			keyboardShouldPersistTaps="handled"
			estimatedItemSize={estimatedItemSize}
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
