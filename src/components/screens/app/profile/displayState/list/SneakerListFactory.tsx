import { useCallback, useMemo } from 'react';

import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { useChunkedListData } from '@/components/screens/app/profile/displayState/list/hooks/useChunkedListData';
import { useSneakerFiltering } from '@/components/screens/app/profile/displayState/list/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

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

export default function SneakerListFactory({
	sneakers,
	userSneakers,
	showOwnerInfo = false,
	refreshing = false,
	onRefresh,
	chunkSize = 10,
	bufferSize = 4,
	threshold = 50,
	maxChunksInMemory = 30,
}: SneakerListFactoryProps) {
	const shouldUseChunking = sneakers.length >= threshold;
	const normalStrategy = useSneakerFiltering({ sneakers });

	const chunkedStrategy = useChunkedListData(sneakers, {
		chunkSize,
		bufferSize,
		threshold,
		maxChunksInMemory,
	});

	const renderItem = useCallback(
		({ item }: { item: Sneaker }) => (
			<SwipeableWrapper
				item={item}
				showOwnerInfo={showOwnerInfo}
				userSneakers={userSneakers}
			/>
		),
		[showOwnerInfo, userSneakers]
	);

	const keyExtractor = useCallback((item: Sneaker) => {
		return item.id || Math.random().toString();
	}, []);

	const handleVerticalScroll = useCallback(
		(event: any) => {
			if (!shouldUseChunking) return;

			const { contentOffset, layoutMeasurement } = event.nativeEvent;
			const scrollY = contentOffset.y;
			const viewHeight = layoutMeasurement.height;

			const currentVisibleCount = chunkedStrategy.visibleSneakers.length;
			const startIndex = Math.max(0, currentVisibleCount - bufferSize);
			const endIndex = Math.min(
				chunkedStrategy.totalSneakers,
				currentVisibleCount + chunkSize * 2
			);

			const bufferedStartIndex = Math.max(0, startIndex - bufferSize);
			const bufferedEndIndex = Math.min(
				chunkedStrategy.totalSneakers,
				endIndex + bufferSize
			);

			chunkedStrategy.onScroll({
				start: bufferedStartIndex,
				end: bufferedEndIndex,
			});
		},
		[shouldUseChunking, chunkedStrategy, bufferSize, chunkSize]
	);

	const handleEndReached = useCallback(() => {
		if (!shouldUseChunking) return;

		const currentVisibleCount = chunkedStrategy.visibleSneakers.length;
		const extendedRange = {
			start: Math.max(0, currentVisibleCount - bufferSize),
			end: Math.min(
				chunkedStrategy.totalSneakers,
				currentVisibleCount + chunkSize * 2
			),
		};

		chunkedStrategy.onScroll(extendedRange);
	}, [shouldUseChunking, chunkedStrategy, bufferSize, chunkSize]);

	const ListHeaderComponent = useMemo(() => {
		const strategy = shouldUseChunking ? chunkedStrategy : normalStrategy;
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
		} = strategy;

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
	}, [shouldUseChunking, normalStrategy, chunkedStrategy]);

	const displayData = shouldUseChunking
		? chunkedStrategy.visibleSneakers
		: normalStrategy.filteredAndSortedSneakers;

	const flashListProps = useMemo(
		() => ({
			data: displayData,
			renderItem,
			keyExtractor,
			ListHeaderComponent,
			onScroll: shouldUseChunking ? handleVerticalScroll : undefined,
			onEndReached: shouldUseChunking ? handleEndReached : undefined,
			onEndReachedThreshold: shouldUseChunking ? 0.1 : 0.5,
			scrollEventThrottle: shouldUseChunking ? 16 : undefined,
			removeClippedSubviews: true,
			estimatedItemSize: ESTIMATED_ITEM_HEIGHT,
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
			shouldUseChunking,
			handleVerticalScroll,
			handleEndReached,
		]
	);

	return (
		<View className="flex-1">
			<FlashList {...flashListProps} />
		</View>
	);
}
