import { useMemo } from 'react';

import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import { Sneaker } from '@/types/sneaker';

export function useDisplayStrategy(sneakers: Sneaker[]) {
	const { filteredAndSortedSneakers } = useLocalSneakerData(sneakers);

	const sneakersByBrand = useMemo(() => {
		if (
			!filteredAndSortedSneakers ||
			filteredAndSortedSneakers.length === 0
		) {
			return {};
		}

		return filteredAndSortedSneakers.reduce(
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
	}, [filteredAndSortedSneakers]);

	const brandAnalysis = useMemo(() => {
		return Object.entries(sneakersByBrand).map(
			([normalizedBrand, sneakers]) => ({
				brand: sneakers[0]?.brand?.name || normalizedBrand,
				normalizedBrand,
				sneakersCount: sneakers.length,
				needsChunking: sneakers.length >= 20,
			})
		);
	}, [sneakersByBrand]);

	const shouldUseHybridChunking = useMemo(() => {
		return brandAnalysis.some((brand) => brand.needsChunking);
	}, [brandAnalysis]);

	const shouldUseListChunking = useMemo(() => {
		return sneakers.length >= 50;
	}, [sneakers.length]);

	return {
		shouldUseHybridChunking,
		shouldUseListChunking,
		brandAnalysis,
		sneakersByBrand,
	};
}
