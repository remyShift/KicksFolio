export const DISPLAY_CONFIG = {
	list: {
		chunkSize: 10,
		bufferSize: 4,
		threshold: 50,
		maxChunksInMemory: 30,
	},

	card: {
		chunkSize: 10,
		sneakersThreshold: 20,
		maxSneakersPerBrandInMemory: 30,
	},

	cardGlobal: {
		brandsPerChunk: 3,
		maxBrandsInMemory: 8,
		threshold: 50,
	},
} as const;

export type DisplayConfig = typeof DISPLAY_CONFIG;
