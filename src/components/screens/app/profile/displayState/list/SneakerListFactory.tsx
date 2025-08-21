import { memo, useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { Sneaker } from '@/types/sneaker';

import { useChunkedListData } from '../../hooks/useChunkedListData';
import ListControls from './ListControls';
import SwipeableWrapper from './SwipeableWrapper';

interface SneakerListFactoryProps {
	sneakers: Sneaker[];
	userSneakers?: Sneaker[];
	showOwnerInfo?: boolean;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
	chunkSize?: number;
	bufferSize?: number;
	threshold?: number;
	maxChunksInMemory?: number;
}

const ESTIMATED_ITEM_HEIGHT = 80;

function SneakerListFactory({
	sneakers,
	userSneakers,
	showOwnerInfo = false,
	refreshing = false,
	onRefresh,
	chunkSize = 10,
	bufferSize = 4,
	threshold = 200,
	maxChunksInMemory = 30,
}: SneakerListFactoryProps) {
	const chunked = useChunkedListData(sneakers, {
		chunkSize,
		bufferSize,
		threshold,
		maxChunksInMemory,
	});

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
				<SwipeableWrapper
					item={item}
					showOwnerInfo={showOwnerInfo}
					userSneakers={userSneakers}
				/>
			);

			return result;
		},
		[showOwnerInfo, userSneakers]
	);

	const keyExtractor = useCallback((item: Sneaker) => {
		return item.id || Math.random().toString();
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

	const handleVisibleIndicesChanged = useCallback(
		(indices: number[]) => {
			if (!indices || indices.length === 0) {
				return;
			}
			const start = Math.min(...indices);
			const end = Math.max(...indices) + 1 + bufferSize * chunkSize;
			chunked.onScroll({ start, end });
		},
		[chunked, bufferSize, chunkSize, displayData.length]
	);

	const handleEndReached = useCallback(() => {
		const totalLoaded = displayData.length;
		const simulatedStart = Math.max(0, totalLoaded - 2 * chunkSize);
		const simulatedEnd = totalLoaded + bufferSize * chunkSize;
		chunked.onScroll({ start: simulatedStart, end: simulatedEnd });
	}, [chunked, displayData.length, bufferSize, chunkSize]);

	const flashListProps = useMemo(
		() => ({
			data: displayData,
			renderItem,
			keyExtractor,
			ListHeaderComponent,
			onScroll: handleScroll,
			onVisibleIndicesChanged: handleVisibleIndicesChanged,
			onEndReached: handleEndReached,
			onEndReachedThreshold: 0.5,
			scrollEventThrottle: 16,
			removeClippedSubviews: true,
			estimatedItemSize: ESTIMATED_ITEM_HEIGHT,
			initialNumToRender: 5,
			maxToRenderPerBatch: 5,
			windowSize: 3,
			updateCellsBatchingPeriod: 100,
			disableVirtualization: false,
			contentContainerStyle: { paddingTop: 0, paddingBottom: 20 },
			showsVerticalScrollIndicator: false,
			scrollEnabled: true,
			nestedScrollEnabled: true,
			indicatorStyle: 'black' as const,
			keyboardShouldPersistTaps: 'handled' as const,
		}),
		[
			displayData,
			renderItem,
			keyExtractor,
			ListHeaderComponent,
			handleScroll,
			handleVisibleIndicesChanged,
		]
	);

	return (
		<View className="flex-1">
			<FlashList {...flashListProps} />
		</View>
	);
}

export default memo(SneakerListFactory, (prevProps, nextProps) => {
	const propsChanged = {
		sneakers: prevProps.sneakers !== nextProps.sneakers,
		userSneakers: prevProps.userSneakers !== nextProps.userSneakers,
		showOwnerInfo: prevProps.showOwnerInfo !== nextProps.showOwnerInfo,
		refreshing: prevProps.refreshing !== nextProps.refreshing,
		onRefresh: prevProps.onRefresh !== nextProps.onRefresh,
		chunkSize: prevProps.chunkSize !== nextProps.chunkSize,
		bufferSize: prevProps.bufferSize !== nextProps.bufferSize,
		threshold: prevProps.threshold !== nextProps.threshold,
		maxChunksInMemory:
			prevProps.maxChunksInMemory !== nextProps.maxChunksInMemory,
	};

	const hasChanges = Object.values(propsChanged).some(Boolean);

	return !hasChanges;
});
