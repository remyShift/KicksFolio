import { useCallback, useMemo } from 'react';

import { RefreshControl, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { useFilteredChunkedSneakers } from '@/hooks/useFilteredChunkedSneakers';
import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import ListControls from './ListControls';
import SneakerSwipeItemList from './SneakerSwipeItemList';

interface SneakerListFactoryProps {
	sneakers: Sneaker[];
	userSneakers?: Sneaker[];
	showOwnerInfo?: boolean;
	refreshing?: boolean;
	onRefresh?: () => Promise<void>;
	chunkSize?: number;
	bufferSize?: number;
	threshold?: number;
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
}: SneakerListFactoryProps) {
	const shouldUseChunking = sneakers.length >= threshold;

	const normalStrategy = useSneakerFiltering({ sneakers });

	const chunkedStrategy = useFilteredChunkedSneakers(sneakers, {
		chunkSize,
		bufferSize,
		threshold,
		maxChunksInMemory: 30,
	});

	const renderItem = useCallback(
		({ item }: { item: Sneaker }) => (
			<SneakerSwipeItemList
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

	const handleScroll = useCallback(
		(event: any) => {
			if (!shouldUseChunking) return;

			const { contentOffset, layoutMeasurement, contentSize } =
				event.nativeEvent;
			const scrollY = contentOffset.y;
			const viewHeight = layoutMeasurement.height;
			const contentHeight = contentSize.height;

			const startIndex = Math.floor(scrollY / ESTIMATED_ITEM_HEIGHT);
			const endIndex = Math.ceil(
				(scrollY + viewHeight) / ESTIMATED_ITEM_HEIGHT
			);

			const isNearEnd = scrollY + viewHeight >= contentHeight - 100;
			const extendedEndIndex = isNearEnd
				? Math.min(
						chunkedStrategy.totalSneakers,
						endIndex + chunkSize * 2
					)
				: endIndex;

			chunkedStrategy.onScroll({
				start: startIndex,
				end: extendedEndIndex,
			});
		},
		[shouldUseChunking, chunkedStrategy, chunkSize]
	);

	const handleEndReached = useCallback(() => {
		if (!shouldUseChunking) return;

		const currentEnd = Math.ceil(0 / ESTIMATED_ITEM_HEIGHT);
		const extendedRange = {
			start: Math.max(0, currentEnd - bufferSize),
			end: Math.min(
				chunkedStrategy.totalSneakers,
				currentEnd + chunkSize * 3
			),
		};

		chunkedStrategy.onScroll(extendedRange);
	}, [shouldUseChunking, chunkedStrategy, bufferSize, chunkSize]);

	const ListHeaderComponent = useMemo(() => {
		if (shouldUseChunking) {
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
			} = chunkedStrategy;

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
		} else {
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
			} = normalStrategy;

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
		}
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
			onScroll: shouldUseChunking ? handleScroll : undefined,
			onEndReached: shouldUseChunking ? handleEndReached : undefined,
			onEndReachedThreshold: shouldUseChunking ? 0.3 : 0.5,
			scrollEventThrottle: shouldUseChunking ? 16 : undefined,
			removeClippedSubviews: true,
			estimatedItemSize: ESTIMATED_ITEM_HEIGHT,
			refreshControl: onRefresh ? (
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					tintColor="#FF6B6B"
					progressViewOffset={60}
				/>
			) : undefined,
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
			handleScroll,
			handleEndReached,
			refreshing,
			onRefresh,
		]
	);

	return (
		<View className="flex-1">
			<FlashList {...flashListProps} />
		</View>
	);
}
