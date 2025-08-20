import { useCallback, useEffect, useMemo, useState } from 'react';

import { Sneaker } from '@/types/sneaker';

interface ChunkConfig {
	chunkSize: number;
	bufferSize: number;
	threshold: number;
	loadTriggerPercent: number;
}

interface ChunkState {
	chunks: Map<string, Sneaker[]>;
	loadedChunkIds: Set<string>;
	currentVisibleRange: { start: number; end: number };
	isChunkingEnabled: boolean;
}

interface UseChunkedSneakersReturn {
	visibleSneakers: Sneaker[];
	isChunkingEnabled: boolean;
	totalSneakers: number;
	loadedChunks: number;
	onScroll: (visibleRange: { start: number; end: number }) => void;
	preloadChunks: (chunkIds: string[]) => void;
	clearChunks: () => void;
}

const DEFAULT_CONFIG: ChunkConfig = {
	chunkSize: 10,
	bufferSize: 4,
	threshold: 50,
	loadTriggerPercent: 75,
};

export function useChunkedSneakers(
	sneakers: Sneaker[],
	config: Partial<ChunkConfig> = {}
): UseChunkedSneakersReturn {
	const finalConfig = useMemo(
		() => ({ ...DEFAULT_CONFIG, ...config }),
		[config]
	);

	const [chunkState, setChunkState] = useState<ChunkState>({
		chunks: new Map(),
		loadedChunkIds: new Set(),
		currentVisibleRange: { start: 0, end: 0 },
		isChunkingEnabled: false,
	});

	const isChunkingEnabled = useMemo(() => {
		const shouldEnable = sneakers.length >= finalConfig.threshold;
		return shouldEnable;
	}, [sneakers.length, finalConfig.threshold]);

	const generateChunkKey = useCallback(
		(startIndex: number, endIndex: number, filterHash: string) => {
			return `chunk_${startIndex}_${endIndex}_${filterHash}`;
		},
		[]
	);

	const getFilterHash = useCallback((sneakers: Sneaker[]) => {
		if (sneakers.length === 0) return 'empty';
		if (sneakers.length === 1) return sneakers[0].id;
		return `${sneakers[0].id}_${sneakers[sneakers.length - 1].id}_${sneakers.length}`;
	}, []);

	const createChunks = useCallback(
		(sneakers: Sneaker[]) => {
			const startTime = Date.now();

			const chunks = new Map<string, Sneaker[]>();
			const filterHash = getFilterHash(sneakers);

			for (let i = 0; i < sneakers.length; i += finalConfig.chunkSize) {
				const endIndex = Math.min(
					i + finalConfig.chunkSize,
					sneakers.length
				);
				const chunkData = sneakers.slice(i, endIndex);
				const chunkKey = generateChunkKey(i, endIndex, filterHash);

				chunks.set(chunkKey, chunkData);
			}

			const creationTime = Date.now() - startTime;

			return { chunks, filterHash };
		},
		[finalConfig.chunkSize, getFilterHash, generateChunkKey]
	);

	const getVisibleChunkIds = useCallback(
		(visibleRange: { start: number; end: number }, filterHash: string) => {
			const { start, end } = visibleRange;
			const { chunkSize, bufferSize } = finalConfig;

			const bufferedStart = Math.max(0, start - bufferSize);
			const bufferedEnd = Math.min(sneakers.length, end + bufferSize);

			const startChunkIndex =
				Math.floor(bufferedStart / chunkSize) * chunkSize;
			const endChunkIndex =
				Math.ceil(bufferedEnd / chunkSize) * chunkSize;

			const chunkIds: string[] = [];
			for (let i = startChunkIndex; i < endChunkIndex; i += chunkSize) {
				const chunkEndIndex = Math.min(i + chunkSize, sneakers.length);
				const chunkKey = generateChunkKey(i, chunkEndIndex, filterHash);
				chunkIds.push(chunkKey);
			}

			return chunkIds;
		},
		[finalConfig, sneakers.length, generateChunkKey]
	);

	useEffect(() => {
		if (!isChunkingEnabled) {
			setChunkState((prev) => ({
				...prev,
				chunks: new Map(),
				loadedChunkIds: new Set(),
				isChunkingEnabled: false,
			}));
			return;
		}

		const { chunks, filterHash } = createChunks(sneakers);

		const initialRange = { start: 0, end: finalConfig.chunkSize * 2 };
		const initialChunkIds = getVisibleChunkIds(initialRange, filterHash);
		const loadedChunkIds = new Set(initialChunkIds);

		setChunkState({
			chunks,
			loadedChunkIds,
			currentVisibleRange: initialRange,
			isChunkingEnabled: true,
		});
	}, [
		sneakers.length,
		isChunkingEnabled,
		finalConfig.chunkSize,
		finalConfig.bufferSize,
		finalConfig.threshold,
	]);

	const onScroll = useCallback(
		(visibleRange: { start: number; end: number }) => {
			if (!isChunkingEnabled) return;

			const filterHash = getFilterHash(sneakers);
			const neededChunkIds = getVisibleChunkIds(visibleRange, filterHash);

			setChunkState((prev) => {
				const newLoadedChunkIds = new Set(prev.loadedChunkIds);
				let hasNewChunks = false;

				neededChunkIds.forEach((chunkId) => {
					if (!newLoadedChunkIds.has(chunkId)) {
						newLoadedChunkIds.add(chunkId);
						hasNewChunks = true;
					}
				});

				return {
					...prev,
					loadedChunkIds: newLoadedChunkIds,
					currentVisibleRange: visibleRange,
				};
			});
		},
		[isChunkingEnabled, getFilterHash, sneakers, getVisibleChunkIds]
	);

	const preloadChunks = useCallback((chunkIds: string[]) => {
		setChunkState((prev) => {
			const newLoadedChunkIds = new Set(prev.loadedChunkIds);
			chunkIds.forEach((id) => newLoadedChunkIds.add(id));

			return {
				...prev,
				loadedChunkIds: newLoadedChunkIds,
			};
		});
	}, []);

	const clearChunks = useCallback(() => {
		setChunkState({
			chunks: new Map(),
			loadedChunkIds: new Set(),
			currentVisibleRange: { start: 0, end: 0 },
			isChunkingEnabled: false,
		});
	}, []);

	const visibleSneakers = useMemo(() => {
		if (!isChunkingEnabled) {
			return sneakers;
		}

		const result: Sneaker[] = [];

		const sortedChunkEntries = Array.from(chunkState.chunks.entries())
			.filter(([chunkId]) => chunkState.loadedChunkIds.has(chunkId))
			.sort(([keyA], [keyB]) => {
				const startA = parseInt(keyA.split('_')[1]);
				const startB = parseInt(keyB.split('_')[1]);
				return startA - startB;
			});

		sortedChunkEntries.forEach(([, chunkData]) => {
			result.push(...chunkData);
		});

		return result;
	}, [
		isChunkingEnabled,
		sneakers,
		chunkState.chunks,
		chunkState.loadedChunkIds,
	]);

	return {
		visibleSneakers,
		isChunkingEnabled,
		totalSneakers: sneakers.length,
		loadedChunks: chunkState.loadedChunkIds.size,
		onScroll,
		preloadChunks,
		clearChunks,
	};
}
