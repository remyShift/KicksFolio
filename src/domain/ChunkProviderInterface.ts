import { Sneaker } from '@/types/sneaker';

export interface ChunkConfig {
	chunkSize: number;
	bufferSize: number;
	threshold: number;
	loadTriggerPercent: number;
}

export interface ChunkData {
	id: string;
	startIndex: number;
	endIndex: number;
	sneakers: Sneaker[];
	isLoaded: boolean;
	lastAccessed: Date;
}

export interface ChunkRange {
	start: number;
	end: number;
}

export interface ChunkProviderInterface {
	createChunks(
		sneakers: Sneaker[],
		config: ChunkConfig,
		filterHash: string
	): ChunkData[];

	getRequiredChunks(
		visibleRange: ChunkRange,
		config: ChunkConfig,
		totalItems: number,
		filterHash: string
	): string[];

	generateChunkKey(
		startIndex: number,
		endIndex: number,
		filterHash: string
	): string;

	calculateFilterHash(sneakers: Sneaker[]): string;

	shouldEnableChunking(itemCount: number, threshold: number): boolean;

	optimizeMemory(chunks: ChunkData[], maxChunksInMemory: number): ChunkData[];
}

export class ChunkProvider implements ChunkProviderInterface {
	createChunks(
		sneakers: Sneaker[],
		config: ChunkConfig,
		filterHash: string
	): ChunkData[] {
		const chunks: ChunkData[] = [];

		for (let i = 0; i < sneakers.length; i += config.chunkSize) {
			const endIndex = Math.min(i + config.chunkSize, sneakers.length);
			const chunkSneakers = sneakers.slice(i, endIndex);

			chunks.push({
				id: this.generateChunkKey(i, endIndex, filterHash),
				startIndex: i,
				endIndex,
				sneakers: chunkSneakers,
				isLoaded: false,
				lastAccessed: new Date(),
			});
		}

		return chunks;
	}

	getRequiredChunks(
		visibleRange: ChunkRange,
		config: ChunkConfig,
		totalItems: number,
		filterHash: string
	): string[] {
		const { start, end } = visibleRange;
		const { chunkSize, bufferSize } = config;

		const bufferedStart = Math.max(0, start - bufferSize);
		const bufferedEnd = Math.min(totalItems, end + bufferSize);

		const startChunkIndex =
			Math.floor(bufferedStart / chunkSize) * chunkSize;
		const endChunkIndex = Math.ceil(bufferedEnd / chunkSize) * chunkSize;

		const chunkIds: string[] = [];
		for (let i = startChunkIndex; i < endChunkIndex; i += chunkSize) {
			const chunkEndIndex = Math.min(i + chunkSize, totalItems);
			const chunkKey = this.generateChunkKey(
				i,
				chunkEndIndex,
				filterHash
			);
			chunkIds.push(chunkKey);
		}

		return chunkIds;
	}

	generateChunkKey(
		startIndex: number,
		endIndex: number,
		filterHash: string
	): string {
		return `chunk_${startIndex}_${endIndex}_${filterHash}`;
	}

	calculateFilterHash(sneakers: Sneaker[]): string {
		if (sneakers.length === 0) return 'empty';
		if (sneakers.length === 1) return sneakers[0].id;

		return `${sneakers[0].id}_${sneakers[sneakers.length - 1].id}_${sneakers.length}`;
	}

	shouldEnableChunking(itemCount: number, threshold: number): boolean {
		return itemCount >= threshold;
	}

	optimizeMemory(
		chunks: ChunkData[],
		maxChunksInMemory: number
	): ChunkData[] {
		if (chunks.length <= maxChunksInMemory) {
			return chunks;
		}

		const sortedChunks = [...chunks].sort(
			(a, b) => a.startIndex - b.startIndex
		);

		const mostRecentChunk = sortedChunks.reduce((latest, current) =>
			current.lastAccessed.getTime() > latest.lastAccessed.getTime()
				? current
				: latest
		);

		const recentChunkIndex = sortedChunks.findIndex(
			(chunk) => chunk.id === mostRecentChunk.id
		);

		const isNearEnd =
			recentChunkIndex >=
			sortedChunks.length - Math.floor(maxChunksInMemory / 2);
		if (isNearEnd) {
			return sortedChunks.slice(
				Math.max(0, sortedChunks.length - maxChunksInMemory)
			);
		}

		const halfWindow = Math.floor(maxChunksInMemory / 2);
		const startIndex = Math.max(0, recentChunkIndex - halfWindow);
		const endIndex = Math.min(
			sortedChunks.length,
			startIndex + maxChunksInMemory
		);

		const actualWindowSize = endIndex - startIndex;
		if (actualWindowSize < maxChunksInMemory) {
			if (startIndex === 0) {
				return sortedChunks.slice(
					0,
					Math.min(sortedChunks.length, maxChunksInMemory)
				);
			} else {
				return sortedChunks.slice(
					Math.max(0, sortedChunks.length - maxChunksInMemory)
				);
			}
		}

		return sortedChunks.slice(startIndex, endIndex);
	}
}
