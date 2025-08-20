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

	console.log(`🏭 [SneakerListFactory] Initialisation:`, {
		sneakersCount: sneakers.length,
		threshold,
		shouldUseChunking,
		chunkSize,
		bufferSize,
	});

	const normalStrategy = useSneakerFiltering({ sneakers });

	const chunkedStrategy = useChunkedListData(sneakers, {
		chunkSize,
		bufferSize,
		threshold,
		maxChunksInMemory: 30,
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

	const handleScroll = useCallback(
		(event: any) => {
			console.log(
				`🎯 [SneakerListFactory] handleScroll appelé, shouldUseChunking:`,
				shouldUseChunking
			);

			if (!shouldUseChunking) {
				console.log(
					`🚫 [SneakerListFactory] Chunking désactivé, scroll ignoré`
				);
				return;
			}

			const { contentOffset, layoutMeasurement, contentSize } =
				event.nativeEvent;
			const scrollY = contentOffset.y;
			const viewHeight = layoutMeasurement.height;
			const contentHeight = contentSize.height;

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

			const isNearEnd = scrollY + viewHeight >= contentHeight - 200;

			console.log(`📜 [SneakerListFactory] Scroll détecté:`, {
				scrollY,
				viewHeight,
				contentHeight,
				startIndex,
				endIndex,
				bufferedStartIndex,
				bufferedEndIndex,
				isNearEnd,
				totalSneakers: chunkedStrategy.totalSneakers,
				visibleSneakersCount: chunkedStrategy.visibleSneakers.length,
				loadedChunks: chunkedStrategy.loadedChunks,
			});

			console.log(
				`📞 [SneakerListFactory] Appel de chunkedStrategy.onScroll avec:`,
				{
					start: bufferedStartIndex,
					end: bufferedEndIndex,
				}
			);

			chunkedStrategy.onScroll({
				start: bufferedStartIndex,
				end: bufferedEndIndex,
			});
		},
		[shouldUseChunking, chunkedStrategy, chunkSize, bufferSize]
	);

	const handleEndReached = useCallback(() => {
		console.log(
			`🏁 [SneakerListFactory] handleEndReached appelé, shouldUseChunking:`,
			shouldUseChunking
		);

		if (!shouldUseChunking) {
			console.log(
				`🚫 [SneakerListFactory] Chunking désactivé, endReached ignoré`
			);
			return;
		}

		const currentVisibleCount = chunkedStrategy.visibleSneakers.length;
		const extendedRange = {
			start: Math.max(0, currentVisibleCount - bufferSize),
			end: Math.min(
				chunkedStrategy.totalSneakers,
				currentVisibleCount + chunkSize * 2
			),
		};

		console.log(
			`🏁 [SneakerListFactory] handleEndReached - extendedRange:`,
			extendedRange
		);

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

	const flashListProps = useMemo(() => {
		const props = {
			data: displayData,
			renderItem,
			keyExtractor,
			ListHeaderComponent,
			onScroll: shouldUseChunking ? handleScroll : undefined,
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
		};

		console.log(`📋 [SneakerListFactory] FlashList props:`, {
			dataLength: displayData.length,
			shouldUseChunking,
			hasOnScroll: !!props.onScroll,
			hasOnEndReached: !!props.onEndReached,
			scrollEventThrottle: props.scrollEventThrottle,
			scrollEnabled: props.scrollEnabled,
		});

		return props;
	}, [
		displayData,
		renderItem,
		keyExtractor,
		ListHeaderComponent,
		shouldUseChunking,
		handleScroll,
		handleEndReached,
	]);

	return (
		<View className="flex-1">
			<FlashList {...flashListProps} />
		</View>
	);
}
