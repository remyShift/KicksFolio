import { useCallback, useEffect, useMemo, useState } from 'react';

import { Sneaker } from '@/types/sneaker';

interface ChunkedCardData {
	brandName: string;
	normalizedBrand: string;
	sneakers: Sneaker[];
	isLoaded: boolean;
	lastAccessed: Date;
}

interface UseChunkedCardDataConfig {
	brandsPerChunk?: number;
	maxBrandsInMemory?: number;
	threshold?: number;
}

interface UseChunkedCardDataReturn {
	visibleBrands: ChunkedCardData[];
	isChunkingEnabled: boolean;
	totalBrands: number;
	loadedBrands: number;
	onScroll: (scrollY: number, viewHeight: number) => void;
	preloadBrands: (brandNames: string[]) => void;
	clearBrands: () => void;
	forceMemoryCleanup: () => void;
}

const DEFAULT_CONFIG: Required<UseChunkedCardDataConfig> = {
	brandsPerChunk: 3,
	maxBrandsInMemory: 8,
	threshold: 50,
};

export function useChunkedCardData(
	sneakers: Sneaker[],
	config: UseChunkedCardDataConfig = {}
): UseChunkedCardDataReturn {
	const finalConfig = useMemo(
		() => ({
			...DEFAULT_CONFIG,
			...config,
		}),
		[config]
	);

	const [brandChunks, setBrandChunks] = useState<ChunkedCardData[]>([]);
	const [loadedBrandNames, setLoadedBrandNames] = useState<Set<string>>(
		new Set()
	);

	const sneakersByBrand = useMemo(() => {
		if (!sneakers || sneakers.length === 0) {
			return {};
		}

		return sneakers.reduce(
			(acc, sneaker) => {
				const normalizedBrand =
					sneaker.brand?.name?.toLowerCase().trim() || 'unknown';
				if (!acc[normalizedBrand]) {
					acc[normalizedBrand] = [];
				}
				acc[normalizedBrand].push(sneaker);
				return acc;
			},
			{} as Record<string, Sneaker[]>
		);
	}, [sneakers]);

	const allBrands = useMemo(() => {
		const brands = Object.entries(sneakersByBrand).map(
			([normalizedBrand, sneakers]) => ({
				brandName: sneakers[0]?.brand?.name || normalizedBrand,
				normalizedBrand,
				sneakers,
				isLoaded: false,
				lastAccessed: new Date(),
			})
		);

		return brands;
	}, [sneakersByBrand]);

	const isChunkingEnabled = useMemo(() => {
		const shouldEnable = allBrands.length >= finalConfig.threshold;

		return shouldEnable;
	}, [allBrands.length, finalConfig.threshold]);

	useEffect(() => {
		if (!isChunkingEnabled) {
			setBrandChunks([]);
			setLoadedBrandNames(new Set());
			return;
		}

		const initialBrands = allBrands.slice(
			0,
			finalConfig.brandsPerChunk * 2
		);
		const initialBrandNames = initialBrands.map(
			(brand) => brand.normalizedBrand
		);

		const updatedBrands = allBrands.map((brand) => ({
			...brand,
			isLoaded: initialBrandNames.includes(brand.normalizedBrand),
			lastAccessed: initialBrandNames.includes(brand.normalizedBrand)
				? new Date()
				: brand.lastAccessed,
		}));

		setBrandChunks(updatedBrands);
		setLoadedBrandNames(new Set(initialBrandNames));
	}, [
		allBrands,
		isChunkingEnabled,
		finalConfig.brandsPerChunk,
		finalConfig.threshold,
	]);

	const onScroll = useCallback(
		(scrollY: number, viewHeight: number) => {
			if (!isChunkingEnabled) {
				return;
			}

			const estimatedBrandHeight = 200;
			const visibleStartIndex = Math.floor(
				scrollY / estimatedBrandHeight
			);
			const visibleEndIndex = Math.ceil(
				(scrollY + viewHeight) / estimatedBrandHeight
			);

			const bufferedStartIndex = Math.max(0, visibleStartIndex - 1);
			const bufferedEndIndex = Math.min(
				allBrands.length,
				visibleEndIndex + 2
			);

			const neededBrandNames = allBrands
				.slice(bufferedStartIndex, bufferedEndIndex)
				.map((brand) => brand.normalizedBrand);

			const currentLoadedNames = Array.from(loadedBrandNames);
			const newBrandNames = neededBrandNames.filter(
				(name) => !currentLoadedNames.includes(name)
			);

			const isNearEnd = bufferedEndIndex >= allBrands.length - 2;

			if (isNearEnd) {
				const allBrandNames = allBrands.map(
					(brand) => brand.normalizedBrand
				);
				const alreadyAllLoaded = allBrandNames.every((name) =>
					loadedBrandNames.has(name)
				);
				if (!alreadyAllLoaded) {
					setLoadedBrandNames(new Set(allBrandNames));
				}
			} else if (newBrandNames.length > 0) {
				setLoadedBrandNames((prev) => {
					const newSet = new Set(prev);
					newBrandNames.forEach((name) => newSet.add(name));
					return newSet;
				});

				setBrandChunks((prev) => {
					let changed = false;
					const updated = prev.map((brand) => {
						const shouldBeLoaded = neededBrandNames.includes(
							brand.normalizedBrand
						);
						if (shouldBeLoaded && !brand.isLoaded) {
							changed = true;
							return {
								...brand,
								isLoaded: true,
								lastAccessed: new Date(),
							};
						}
						return brand;
					});
					return changed ? updated : prev;
				});
			}

			if (loadedBrandNames.size > finalConfig.maxBrandsInMemory) {
				const sortedBrands = [...brandChunks].sort(
					(a, b) =>
						b.lastAccessed.getTime() - a.lastAccessed.getTime()
				);
				const brandsToKeep = sortedBrands.slice(
					0,
					finalConfig.maxBrandsInMemory
				);
				const optimizedBrandNames = new Set(
					brandsToKeep.map((brand) => brand.normalizedBrand)
				);

				setBrandChunks(brandsToKeep);
				setLoadedBrandNames(optimizedBrandNames);
			}
		},
		[
			isChunkingEnabled,
			allBrands,
			loadedBrandNames,
			brandChunks,
			finalConfig.maxBrandsInMemory,
		]
	);

	const preloadBrands = useCallback((brandNames: string[]) => {
		setLoadedBrandNames((prev) => {
			const newSet = new Set(prev);
			brandNames.forEach((name) => newSet.add(name));
			return newSet;
		});

		setBrandChunks((prev) =>
			prev.map((brand) => ({
				...brand,
				isLoaded: brandNames.includes(brand.normalizedBrand)
					? true
					: brand.isLoaded,
				lastAccessed: brandNames.includes(brand.normalizedBrand)
					? new Date()
					: brand.lastAccessed,
			}))
		);
	}, []);

	const clearBrands = useCallback(() => {
		setBrandChunks([]);
		setLoadedBrandNames(new Set());
	}, []);

	const forceMemoryCleanup = useCallback(() => {
		if (loadedBrandNames.size > finalConfig.maxBrandsInMemory) {
			const sortedBrands = [...brandChunks].sort(
				(a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime()
			);
			const brandsToKeep = sortedBrands.slice(
				0,
				finalConfig.maxBrandsInMemory
			);
			const optimizedBrandNames = new Set(
				brandsToKeep.map((brand) => brand.normalizedBrand)
			);

			setBrandChunks(brandsToKeep);
			setLoadedBrandNames(optimizedBrandNames);
		}
	}, [brandChunks, loadedBrandNames.size, finalConfig.maxBrandsInMemory]);

	const visibleBrands = useMemo(() => {
		if (!isChunkingEnabled) {
			return allBrands;
		}

		const result = brandChunks
			.filter((brand) => loadedBrandNames.has(brand.normalizedBrand))
			.sort((a, b) => a.normalizedBrand.localeCompare(b.normalizedBrand));

		return result;
	}, [isChunkingEnabled, allBrands, brandChunks, loadedBrandNames]);

	return {
		visibleBrands,
		isChunkingEnabled,
		totalBrands: allBrands.length,
		loadedBrands: loadedBrandNames.size,
		onScroll,
		preloadBrands,
		clearBrands,
		forceMemoryCleanup,
	};
}
