import { useCallback, useEffect, useMemo, useState } from 'react';

import { Sneaker } from '@/types/sneaker';

interface BrandChunkData {
	brandName: string;
	normalizedBrand: string;
	allSneakers: Sneaker[];
	visibleSneakers: Sneaker[];
	isChunkingEnabled: boolean;
	loadedChunks: number;
	totalChunks: number;
	chunkSize: number;
	lastAccessed: Date;
}

interface UseHybridCardDataConfig {
	chunkSize?: number;
	sneakersThreshold?: number;
	maxSneakersPerBrandInMemory?: number;
}

interface UseHybridCardDataReturn {
	brandSections: BrandChunkData[];
	totalBrands: number;
	onScroll: (scrollY: number, viewHeight: number) => void;
	onBrandScroll: (
		brandName: string,
		scrollX: number,
		viewWidth: number
	) => void;
	preloadBrandSneakers: (brandName: string, count: number) => void;
	forceMemoryCleanup: () => void;
}

const DEFAULT_CONFIG: Required<UseHybridCardDataConfig> = {
	chunkSize: 10,
	sneakersThreshold: 20,
	maxSneakersPerBrandInMemory: 30,
};

export function useHybridCardData(
	sneakers: Sneaker[],
	config: UseHybridCardDataConfig = {}
): UseHybridCardDataReturn {
	const finalConfig = useMemo(
		() => ({
			...DEFAULT_CONFIG,
			...config,
		}),
		[config]
	);

	const [brandSections, setBrandSections] = useState<BrandChunkData[]>([]);

	const sneakersByBrand = useMemo(() => {
		if (!sneakers || sneakers.length === 0) {
			return {};
		}

		return sneakers.reduce(
			(acc: Record<string, Sneaker[]>, sneaker: Sneaker) => {
				const normalizedBrand = sneaker.brand.toLowerCase().trim();
				if (!acc[normalizedBrand]) {
					acc[normalizedBrand] = [];
				}
				acc[normalizedBrand].push(sneaker);
				return acc;
			},
			{} as Record<string, Sneaker[]>
		);
	}, [sneakers]);

	useEffect(() => {
		const newBrandSections: BrandChunkData[] = [];

		Object.entries(sneakersByBrand).forEach(
			([normalizedBrand, sneakers]) => {
				const brandName = sneakers[0]?.brand || normalizedBrand;
				const shouldUseChunking =
					sneakers.length >= finalConfig.sneakersThreshold;

				const initialVisibleCount = shouldUseChunking
					? Math.min(finalConfig.chunkSize * 2, sneakers.length)
					: sneakers.length;

				const totalChunks = shouldUseChunking
					? Math.ceil(sneakers.length / finalConfig.chunkSize)
					: 1;

				const loadedChunks = shouldUseChunking
					? Math.ceil(initialVisibleCount / finalConfig.chunkSize)
					: 1;

				newBrandSections.push({
					brandName,
					normalizedBrand,
					allSneakers: sneakers,
					visibleSneakers: sneakers.slice(0, initialVisibleCount),
					isChunkingEnabled: shouldUseChunking,
					loadedChunks,
					totalChunks,
					chunkSize: finalConfig.chunkSize,
					lastAccessed: new Date(),
				});
			}
		);

		newBrandSections.sort((a, b) =>
			a.normalizedBrand.localeCompare(b.normalizedBrand)
		);

		setBrandSections(newBrandSections);
	}, [sneakersByBrand, finalConfig.chunkSize, finalConfig.sneakersThreshold]);

	const onBrandScroll = useCallback(
		(brandName: string, scrollX: number, viewWidth: number) => {
			setBrandSections((prevSections) => {
				let hasChanges = false;

				const updatedSections = prevSections.map((section) => {
					if (
						section.normalizedBrand !== brandName.toLowerCase() ||
						!section.isChunkingEnabled
					) {
						return section;
					}

					const cardWidth = 200;
					const visibleStartIndex = Math.floor(scrollX / cardWidth);
					const visibleEndIndex = Math.ceil(
						(scrollX + viewWidth) / cardWidth
					);

					const bufferedEndIndex = Math.min(
						section.allSneakers.length,
						visibleEndIndex + section.chunkSize
					);

					const shouldLoadMore =
						bufferedEndIndex > section.visibleSneakers.length;
					const isNearEnd =
						bufferedEndIndex >=
						section.allSneakers.length - section.chunkSize;

					if (
						isNearEnd &&
						section.visibleSneakers.length <
							section.allSneakers.length
					) {
						hasChanges = true;
						return {
							...section,
							visibleSneakers: section.allSneakers,
							loadedChunks: section.totalChunks,
							lastAccessed: new Date(),
						};
					} else if (shouldLoadMore) {
						const newVisibleCount = Math.min(
							section.allSneakers.length,
							bufferedEndIndex
						);
						const newLoadedChunks = Math.ceil(
							newVisibleCount / section.chunkSize
						);

						hasChanges = true;
						return {
							...section,
							visibleSneakers: section.allSneakers.slice(
								0,
								newVisibleCount
							),
							loadedChunks: newLoadedChunks,
							lastAccessed: new Date(),
						};
					}

					return {
						...section,
						lastAccessed: new Date(),
					};
				});

				return hasChanges ? updatedSections : prevSections;
			});
		},
		[]
	);

	const onScroll = useCallback(
		(scrollY: number, viewHeight: number) => {
			const estimatedBrandHeight = 200;
			const visibleStartIndex = Math.floor(
				scrollY / estimatedBrandHeight
			);
			const visibleEndIndex = Math.ceil(
				(scrollY + viewHeight) / estimatedBrandHeight
			);

			setBrandSections((prevSections) => {
				const updatedSections = prevSections.map((section, index) => {
					if (
						index >= visibleStartIndex &&
						index <= visibleEndIndex + 1
					) {
						return {
							...section,
							lastAccessed: new Date(),
						};
					}
					return section;
				});

				return updatedSections;
			});
		},
		[brandSections.length]
	);

	const preloadBrandSneakers = useCallback(
		(brandName: string, count: number) => {
			setBrandSections((prevSections) =>
				prevSections.map((section) => {
					if (section.normalizedBrand === brandName.toLowerCase()) {
						const newVisibleCount = Math.min(
							section.allSneakers.length,
							section.visibleSneakers.length + count
						);
						const newLoadedChunks = Math.ceil(
							newVisibleCount / section.chunkSize
						);

						return {
							...section,
							visibleSneakers: section.allSneakers.slice(
								0,
								newVisibleCount
							),
							loadedChunks: newLoadedChunks,
							lastAccessed: new Date(),
						};
					}
					return section;
				})
			);
		},
		[]
	);

	const forceMemoryCleanup = useCallback(() => {
		setBrandSections((prevSections) =>
			prevSections.map((section) => {
				if (!section.isChunkingEnabled) {
					return section;
				}

				if (
					section.visibleSneakers.length >
					finalConfig.maxSneakersPerBrandInMemory
				) {
					const reducedCount =
						finalConfig.maxSneakersPerBrandInMemory;
					const newLoadedChunks = Math.ceil(
						reducedCount / section.chunkSize
					);

					return {
						...section,
						visibleSneakers: section.allSneakers.slice(
							0,
							reducedCount
						),
						loadedChunks: newLoadedChunks,
					};
				}
				return section;
			})
		);
	}, [finalConfig.maxSneakersPerBrandInMemory]);

	return {
		brandSections,
		totalBrands: brandSections.length,
		onScroll,
		onBrandScroll,
		preloadBrandSneakers,
		forceMemoryCleanup,
	};
}
