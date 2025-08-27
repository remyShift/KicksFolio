import { useMemo } from 'react';

import { SharedCollectionData } from '@/types/sharing';

interface SharedCollectionFiltersProps {
	collectionData: SharedCollectionData | null;
}

export function useSharedCollectionFilters({
	collectionData,
}: SharedCollectionFiltersProps) {
	const filteredSneakers = useMemo(() => {
		if (!collectionData) return [];

		const filters = collectionData.filters;

		if (
			!filters ||
			(!filters.brands?.length &&
				!filters.sizes?.length &&
				!filters.conditions?.length &&
				!filters.statuses?.length)
		) {
			return collectionData.sneakers_data;
		}

		return collectionData.sneakers_data.filter((sneaker) => {
			let matches = true;

			if (filters.brands?.length > 0) {
				matches =
					matches &&
					filters.brands.includes(sneaker.brand?.name || '');
			}

			if (filters.sizes?.length > 0) {
				const sizeEU = sneaker.size_eu?.toString();
				const sizeUS = sneaker.size_us?.toString();
				matches =
					matches &&
					(filters.sizes.includes(sizeEU) ||
						filters.sizes.includes(sizeUS));
			}

			if (filters.conditions?.length > 0) {
				matches =
					matches &&
					filters.conditions.includes(sneaker.condition?.toString());
			}

			if (filters.statuses?.length > 0) {
				const selectedStatuses = filters.statuses.map((s) =>
					s.toString()
				);
				matches =
					matches &&
					selectedStatuses.includes(sneaker.status_id?.toString());
			}

			return matches;
		});
	}, [collectionData?.sneakers_data, collectionData?.filters]);

	const contextSneakers = useMemo(() => {
		return collectionData?.sneakers_data || [];
	}, [collectionData?.sneakers_data]);

	return { filteredSneakers, contextSneakers };
}
