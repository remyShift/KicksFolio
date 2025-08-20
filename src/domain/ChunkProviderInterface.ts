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

		const bufferedStart = Math.max(0, start - bufferSize * chunkSize);
		const bufferedEnd = Math.min(totalItems, end + bufferSize * chunkSize);

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

		console.log(`🧹 [ChunkProvider] Optimisation mémoire:`, {
			totalChunks: chunks.length,
			maxChunksInMemory,
		});

		// Trier les chunks par dernière utilisation
		const sortedChunks = [...chunks].sort(
			(a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime()
		);

		// Garder les chunks les plus récemment utilisés
		const chunksToKeep = sortedChunks.slice(0, maxChunksInMemory);

		// Trier par index pour maintenir l'ordre
		const optimizedChunks = chunksToKeep.sort(
			(a, b) => a.startIndex - b.startIndex
		);

		console.log(`🧹 [ChunkProvider] Optimisation terminée:`, {
			kept: optimizedChunks.length,
			removed: chunks.length - optimizedChunks.length,
			keptRange:
				optimizedChunks.length > 0
					? {
							start: optimizedChunks[0].startIndex,
							end: optimizedChunks[optimizedChunks.length - 1]
								.endIndex,
						}
					: null,
		});

		return optimizedChunks;
	}
}
