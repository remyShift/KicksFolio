import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	ChunkConfig,
	ChunkData,
	ChunkRange,
} from '@/domain/ChunkProviderInterface';
import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import { chunkProvider } from '@/tech/proxy/ChunkProxy';
import { Sneaker } from '@/types/sneaker';

interface UseFilteredChunkedSneakersConfig extends Partial<ChunkConfig> {
	maxChunksInMemory?: number;
}

interface UseFilteredChunkedSneakersReturn {
	visibleSneakers: Sneaker[];
	isChunkingEnabled: boolean;
	totalSneakers: number;
	loadedChunks: number;
	visibleRange: ChunkRange;
	filteredAndSortedSneakers: Sneaker[];
	onScroll: (visibleRange: ChunkRange) => void;
	preloadChunks: (chunkIds: string[]) => void;
	clearChunks: () => void;
	forceMemoryCleanup: () => void;
	uniqueValues: {
		brands: string[];
		sizes: string[];
		conditions: string[];
		statuses: string[];
	};
	sortBy: any;
	sortOrder: any;
	showFilters: boolean;
	filters: any;
	toggleSort: (option: any) => void;
	toggleFilters: () => void;
	updateFilter: (filterType: any, values: string[]) => void;
	clearFilters: () => void;
}

const DEFAULT_CONFIG: ChunkConfig = {
	chunkSize: 10,
	bufferSize: 4,
	threshold: 50,
	loadTriggerPercent: 75,
};

export function useFilteredChunkedSneakers(
	sneakers: Sneaker[],
	config: UseFilteredChunkedSneakersConfig = {}
): UseFilteredChunkedSneakersReturn {
	const finalConfig = useMemo(
		() => ({
			...DEFAULT_CONFIG,
			...config,
		}),
		[config]
	);

	const maxChunksInMemory = config.maxChunksInMemory || 10;

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
	} = useLocalSneakerData(sneakers);

	const [chunks, setChunks] = useState<ChunkData[]>([]);
	const [loadedChunkIds, setLoadedChunkIds] = useState<Set<string>>(
		new Set()
	);
	const [currentVisibleRange, setCurrentVisibleRange] = useState<ChunkRange>({
		start: 0,
		end: 0,
	});

	const isChunkingEnabled = useMemo(() => {
		const shouldEnable = chunkProvider.shouldEnableChunking(
			filteredAndSortedSneakers.length,
			finalConfig.threshold
		);
		console.log(`🔧 [useFilteredChunkedSneakers] État du chunking:`, {
			sneakersCount: filteredAndSortedSneakers.length,
			threshold: finalConfig.threshold,
			isEnabled: shouldEnable,
		});
		return shouldEnable;
	}, [filteredAndSortedSneakers.length, finalConfig.threshold]);

	useEffect(() => {
		if (!isChunkingEnabled) {
			console.log(
				`🚫 [useFilteredChunkedSneakers] Chunking désactivé, réinitialisation des chunks`
			);
			setChunks([]);
			setLoadedChunkIds(new Set());
			return;
		}

		console.log(
			`🏗️ [useFilteredChunkedSneakers] Initialisation des chunks:`,
			{
				sneakersCount: filteredAndSortedSneakers.length,
				config: finalConfig,
			}
		);

		const filterHash = chunkProvider.calculateFilterHash(
			filteredAndSortedSneakers
		);
		const newChunks = chunkProvider.createChunks(
			filteredAndSortedSneakers,
			finalConfig,
			filterHash
		);

		const initialRange = { start: 0, end: finalConfig.chunkSize * 2 };
		const initialChunkIds = chunkProvider.getRequiredChunks(
			initialRange,
			finalConfig,
			filteredAndSortedSneakers.length,
			filterHash
		);

		console.log(`✅ [useFilteredChunkedSneakers] Chunks créés:`, {
			chunksCount: newChunks.length,
			filterHash,
			initialChunkIds,
			initialRange,
			chunks: newChunks.map((chunk) => ({
				id: chunk.id,
				startIndex: chunk.startIndex,
				endIndex: chunk.endIndex,
				sneakersCount: chunk.sneakers.length,
			})),
		});

		const updatedChunks = newChunks.map((chunk) => ({
			...chunk,
			isLoaded: initialChunkIds.includes(chunk.id),
			lastAccessed: initialChunkIds.includes(chunk.id)
				? new Date()
				: chunk.lastAccessed,
		}));

		setChunks(updatedChunks);
		setLoadedChunkIds(new Set(initialChunkIds));
		setCurrentVisibleRange(initialRange);
	}, [
		filteredAndSortedSneakers.length,
		isChunkingEnabled,
		finalConfig.chunkSize,
		finalConfig.bufferSize,
		finalConfig.threshold,
	]);

	const onScroll = useCallback(
		(visibleRange: ChunkRange) => {
			if (!isChunkingEnabled) {
				console.log(
					`🚫 [useFilteredChunkedSneakers] Chunking désactivé`
				);
				return;
			}

			console.log(`🔄 [useFilteredChunkedSneakers] onScroll appelé:`, {
				visibleRange,
				totalSneakers: filteredAndSortedSneakers.length,
				currentLoadedChunks: loadedChunkIds.size,
				totalChunks: chunks.length,
			});

			const filterHash = chunkProvider.calculateFilterHash(
				filteredAndSortedSneakers
			);
			const neededChunkIds = chunkProvider.getRequiredChunks(
				visibleRange,
				finalConfig,
				filteredAndSortedSneakers.length,
				filterHash
			);

			const currentLoadedIds = Array.from(loadedChunkIds);
			const newChunkIds = neededChunkIds.filter(
				(id) => !currentLoadedIds.includes(id)
			);

			const isNearEnd =
				visibleRange.end >=
				filteredAndSortedSneakers.length - finalConfig.chunkSize * 2;

			console.log(`📦 [useFilteredChunkedSneakers] Analyse des chunks:`, {
				filterHash,
				neededChunkIds,
				currentLoadedIds,
				newChunkIds,
				isNearEnd,
				visibleRangeEnd: visibleRange.end,
				totalSneakers: filteredAndSortedSneakers.length,
				threshold: finalConfig.chunkSize * 2,
			});

			if (isNearEnd) {
				const allChunkIds = chunks.map((chunk) => chunk.id);
				const alreadyAllLoaded = allChunkIds.every((id) =>
					loadedChunkIds.has(id)
				);
				if (!alreadyAllLoaded) {
					console.log(
						`🚀 [useFilteredChunkedSneakers] Chargement de tous les chunks restants:`,
						allChunkIds
					);
					setLoadedChunkIds(new Set(allChunkIds));
				} else {
					console.log(
						`✅ [useFilteredChunkedSneakers] Tous les chunks déjà chargés`
					);
				}
			} else {
				if (newChunkIds.length > 0) {
					console.log(
						`📥 [useFilteredChunkedSneakers] Chargement de nouveaux chunks:`,
						newChunkIds
					);
					setLoadedChunkIds((prev) => {
						const newLoadedChunkIds = new Set(prev);
						newChunkIds.forEach((chunkId) =>
							newLoadedChunkIds.add(chunkId)
						);
						return newLoadedChunkIds;
					});

					setChunks((prev) => {
						let changed = false;
						const updated = prev.map((chunk) => {
							const shouldBeLoaded = neededChunkIds.includes(
								chunk.id
							);
							if (shouldBeLoaded && !chunk.isLoaded) {
								changed = true;
								return {
									...chunk,
									isLoaded: true,
									lastAccessed: new Date(),
								};
							}
							return chunk;
						});
						return changed ? updated : prev;
					});
				} else {
					console.log(
						`ℹ️ [useFilteredChunkedSneakers] Aucun nouveau chunk à charger`
					);
				}
			}

			if (loadedChunkIds.size > maxChunksInMemory) {
				console.log(
					`🧹 [useFilteredChunkedSneakers] Nettoyage mémoire déclenché:`,
					{
						currentLoadedChunks: loadedChunkIds.size,
						maxChunksInMemory,
					}
				);

				const optimizedChunks = chunkProvider.optimizeMemory(
					chunks,
					maxChunksInMemory
				);
				const optimizedIds = new Set(
					optimizedChunks.map((chunk) => chunk.id)
				);

				console.log(
					`🧹 [useFilteredChunkedSneakers] Chunks après optimisation:`,
					{
						before: chunks.length,
						after: optimizedChunks.length,
						removed: chunks.length - optimizedChunks.length,
						keptIds: Array.from(optimizedIds),
					}
				);

				setChunks(optimizedChunks);
				setLoadedChunkIds(
					(prev) =>
						new Set([...prev].filter((id) => optimizedIds.has(id)))
				);
			}

			setCurrentVisibleRange((prev) => {
				if (
					prev.start === visibleRange.start &&
					prev.end === visibleRange.end
				) {
					return prev;
				}
				console.log(
					`📍 [useFilteredChunkedSneakers] Mise à jour de la plage visible:`,
					{
						from: prev,
						to: visibleRange,
					}
				);
				return visibleRange;
			});
		},
		[
			isChunkingEnabled,
			filteredAndSortedSneakers,
			finalConfig,
			loadedChunkIds,
			chunks,
			maxChunksInMemory,
		]
	);

	const preloadChunks = useCallback((chunkIds: string[]) => {
		setLoadedChunkIds((prev) => {
			const newSet = new Set(prev);
			chunkIds.forEach((id) => newSet.add(id));
			return newSet;
		});

		setChunks((prev) =>
			prev.map((chunk) => ({
				...chunk,
				isLoaded: chunkIds.includes(chunk.id) ? true : chunk.isLoaded,
				lastAccessed: chunkIds.includes(chunk.id)
					? new Date()
					: chunk.lastAccessed,
			}))
		);
	}, []);

	const clearChunks = useCallback(() => {
		setChunks([]);
		setLoadedChunkIds(new Set());
		setCurrentVisibleRange({ start: 0, end: 0 });
	}, []);

	const forceMemoryCleanup = useCallback(() => {
		if (loadedChunkIds.size > maxChunksInMemory) {
			console.log(
				`🧹 [useFilteredChunkedSneakers] Nettoyage mémoire forcé`
			);

			const optimizedChunks = chunkProvider.optimizeMemory(
				chunks,
				maxChunksInMemory
			);
			const optimizedIds = new Set(
				optimizedChunks.map((chunk) => chunk.id)
			);

			setChunks(optimizedChunks);
			setLoadedChunkIds(
				(prev) =>
					new Set([...prev].filter((id) => optimizedIds.has(id)))
			);
		}
	}, [chunks, loadedChunkIds.size, maxChunksInMemory]);

	useEffect(() => {
		if (!isChunkingEnabled || loadedChunkIds.size <= maxChunksInMemory) {
			return;
		}

		const interval = setInterval(() => {
			if (loadedChunkIds.size > maxChunksInMemory) {
				console.log(
					`🧹 [useFilteredChunkedSneakers] Nettoyage mémoire périodique`
				);
				forceMemoryCleanup();
			}
		}, 30000);

		return () => clearInterval(interval);
	}, [
		isChunkingEnabled,
		loadedChunkIds.size,
		maxChunksInMemory,
		forceMemoryCleanup,
	]);

	const visibleSneakers = useMemo(() => {
		if (!isChunkingEnabled) {
			console.log(
				`📋 [useFilteredChunkedSneakers] Chunking désactivé, retour de tous les sneakers:`,
				filteredAndSortedSneakers.length
			);
			return filteredAndSortedSneakers;
		}

		const result: Sneaker[] = [];

		const loadedChunks = chunks
			.filter((chunk) => loadedChunkIds.has(chunk.id))
			.sort((a, b) => a.startIndex - b.startIndex);

		loadedChunks.forEach((chunk) => {
			result.push(...chunk.sneakers);
		});

		console.log(`📋 [useFilteredChunkedSneakers] Sneakers visibles:`, {
			totalSneakers: filteredAndSortedSneakers.length,
			visibleSneakers: result.length,
			loadedChunksCount: loadedChunks.length,
			totalChunks: chunks.length,
			loadedChunkIds: Array.from(loadedChunkIds),
		});

		return result;
	}, [isChunkingEnabled, filteredAndSortedSneakers, chunks, loadedChunkIds]);

	return {
		visibleSneakers,
		isChunkingEnabled,
		totalSneakers: filteredAndSortedSneakers.length,
		loadedChunks: loadedChunkIds.size,
		visibleRange: currentVisibleRange,
		filteredAndSortedSneakers,
		onScroll,
		preloadChunks,
		clearChunks,
		forceMemoryCleanup,
		uniqueValues,
		sortBy,
		sortOrder,
		showFilters,
		filters,
		toggleSort,
		toggleFilters,
		updateFilter,
		clearFilters,
	};
}
