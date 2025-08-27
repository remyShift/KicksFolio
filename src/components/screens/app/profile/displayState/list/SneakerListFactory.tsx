import { memo, useCallback, useEffect, useMemo } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { Sneaker } from '@/types/sneaker';

import { useChunkedListData } from '../../hooks/useChunkedListData';
import ListControls from './ListControls';
import ProfileSwipeableWrapper from './SwipeableWrapper';

interface SneakerListFactoryProps {
	sneakers: Sneaker[];
	userSneakers?: Sneaker[];
	showOwnerInfo?: boolean;
	chunkSize?: number;
	bufferSize?: number;
	threshold?: number;
	maxChunksInMemory?: number;
	customSwipeActions?: React.ComponentType<any>;
	customMainContent?: React.ComponentType<any>;
	onFiltersChange?: (filters: any) => void;
}

const ESTIMATED_ITEM_HEIGHT = 80;

function SneakerListFactory({
	sneakers,
	userSneakers,
	showOwnerInfo = false,
	chunkSize = 10,
	bufferSize = 4,
	threshold = 200,
	maxChunksInMemory = 30,
	customSwipeActions,
	customMainContent,
	onFiltersChange,
}: SneakerListFactoryProps) {
	const chunked = useChunkedListData(sneakers, {
		chunkSize,
		bufferSize,
		threshold,
		maxChunksInMemory,
	});

	useEffect(() => {
		if (onFiltersChange) {
			onFiltersChange({
				filters: chunked.filters,
				uniqueValues: chunked.uniqueValues,
			});
		}
	}, [chunked.filters, chunked.uniqueValues, onFiltersChange]);

	const normalStrategy = useMemo(
		() => ({
			filteredAndSortedSneakers: chunked.visibleSneakers,
			uniqueValues: chunked.uniqueValues,
			sortBy: chunked.sortBy,
			sortOrder: chunked.sortOrder,
			showFilters: chunked.showFilters,
			filters: chunked.filters,
			toggleSort: chunked.toggleSort,
			toggleFilters: chunked.toggleFilters,
			updateFilter: chunked.updateFilter,
			clearFilters: chunked.clearFilters,
		}),
		[
			chunked.visibleSneakers,
			chunked.uniqueValues,
			chunked.sortBy,
			chunked.sortOrder,
			chunked.showFilters,
			chunked.filters,
			chunked.toggleSort,
			chunked.toggleFilters,
			chunked.updateFilter,
			chunked.clearFilters,
		]
	);

	const renderItem = useCallback(
		({ item, index }: { item: Sneaker; index: number }) => {
			const result = (
				<ProfileSwipeableWrapper
					item={item}
					showOwnerInfo={showOwnerInfo}
					userSneakers={userSneakers}
					customSwipeActions={customSwipeActions}
					customMainContent={customMainContent}
				/>
			);

			return result;
		},
		[showOwnerInfo, userSneakers, customSwipeActions, customMainContent]
	);

	const keyExtractor = useCallback((item: Sneaker) => {
		const key = item.id || Math.random().toString();
		return key;
	}, []);

	const ListHeaderComponent = useMemo(() => {
		return (
			<ListControls
				uniqueValues={normalStrategy.uniqueValues}
				sortBy={normalStrategy.sortBy}
				sortOrder={normalStrategy.sortOrder}
				showFilters={normalStrategy.showFilters}
				filters={normalStrategy.filters}
				onToggleSort={normalStrategy.toggleSort}
				onToggleFilters={normalStrategy.toggleFilters}
				onUpdateFilter={normalStrategy.updateFilter}
				onClearFilters={normalStrategy.clearFilters}
				filteredAndSortedSneakers={chunked.filteredAndSortedSneakers}
				visibleSneakers={normalStrategy.filteredAndSortedSneakers}
			/>
		);
	}, [normalStrategy, chunked.filteredAndSortedSneakers]);

	const displayData = normalStrategy.filteredAndSortedSneakers;

	const handleScroll = useCallback(
		(event: any) => {
			const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;
			const viewportH =
				event?.nativeEvent?.layoutMeasurement?.height ?? 0;
			const startIndex = Math.max(
				0,
				Math.floor(offsetY / ESTIMATED_ITEM_HEIGHT)
			);
			const endIndex = Math.ceil(
				(offsetY + viewportH) / ESTIMATED_ITEM_HEIGHT
			);

			const totalVisible = displayData.length;
			const isNearEnd = endIndex >= totalVisible - 5;

			if (isNearEnd) {
				const extendedEnd = endIndex + bufferSize * chunkSize;
				chunked.onScroll({ start: startIndex, end: extendedEnd });
			} else {
				chunked.onScroll({ start: startIndex, end: endIndex });
			}
		},
		[chunked, displayData.length, bufferSize, chunkSize]
	);

	const handleEndReached = useCallback(() => {
		const totalLoaded = displayData.length;
		const simulatedStart = Math.max(0, totalLoaded - 2 * chunkSize);
		const simulatedEnd = totalLoaded + bufferSize * chunkSize;
		chunked.onScroll({ start: simulatedStart, end: simulatedEnd });
	}, [chunked, displayData.length, bufferSize, chunkSize]);

	return (
		<View className="flex-1">
			<FlashList
				data={displayData}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ListHeaderComponent={ListHeaderComponent}
				onScroll={handleScroll}
				onEndReached={handleEndReached}
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

export default memo(SneakerListFactory, (prevProps, nextProps) => {
	const propsChanged = {
		sneakers: prevProps.sneakers !== nextProps.sneakers,
		userSneakers: prevProps.userSneakers !== nextProps.userSneakers,
		showOwnerInfo: prevProps.showOwnerInfo !== nextProps.showOwnerInfo,
		chunkSize: prevProps.chunkSize !== nextProps.chunkSize,
		bufferSize: prevProps.bufferSize !== nextProps.bufferSize,
		threshold: prevProps.threshold !== nextProps.threshold,
		maxChunksInMemory:
			prevProps.maxChunksInMemory !== nextProps.maxChunksInMemory,
	};

	const hasChanges = Object.values(propsChanged).some(Boolean);

	return !hasChanges;
});
