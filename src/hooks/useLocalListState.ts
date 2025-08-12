import { useCallback, useMemo, useState } from 'react';

import { sneakerFilteringProvider } from '@/d/SneakerFiltering';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { UniqueValues } from '@/types/filter';
import { FilterState, SortOption } from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

export function useLocalListState(sneakers: Sneaker[]) {
	const [showFilters, setShowFilters] = useState(false);
	const [sortBy, setSortBy] = useState<SortOption>('name');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [filters, setFilters] = useState<FilterState>({
		brands: [],
		sizes: [],
		conditions: [],
	});
	const { currentUnit } = useSizeUnitStore();

	const uniqueValues = useMemo((): UniqueValues => {
		try {
			return sneakerFilteringProvider.getUniqueValues(
				sneakers,
				currentUnit
			);
		} catch (error) {
			console.error('❌ Error getting unique values:', error);
			return {
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			};
		}
	}, [sneakers, currentUnit]);

	const filteredSneakers = useMemo(() => {
		try {
			return sneakerFilteringProvider.filterSneakers(
				sneakers,
				filters,
				currentUnit
			);
		} catch (error) {
			console.error('❌ Error filtering sneakers:', error);
			return sneakers;
		}
	}, [sneakers, filters, currentUnit]);

	const filteredAndSortedSneakers = useMemo(() => {
		try {
			return sneakerFilteringProvider.sortSneakers(
				filteredSneakers,
				sortBy,
				sortOrder,
				currentUnit
			);
		} catch (error) {
			console.error('❌ Error sorting sneakers:', error);
			return filteredSneakers;
		}
	}, [filteredSneakers, sortBy, sortOrder, currentUnit]);

	const toggleFilters = useCallback(() => {
		setShowFilters((prev) => !prev);
	}, []);

	const toggleSort = useCallback(
		(option: SortOption) => {
			if (sortBy === option) {
				setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
			} else {
				setSortBy(option);
				setSortOrder('asc');
			}
		},
		[sortBy]
	);

	const updateFilter = useCallback(
		(key: keyof FilterState, value: string[]) => {
			setFilters((prev) => {
				const newFilters = { ...prev };
				if (value === undefined) {
					delete newFilters[key];
				} else {
					newFilters[key] = value;
				}
				return newFilters;
			});
		},
		[]
	);

	const clearFilters = useCallback(() => {
		setFilters({ brands: [], sizes: [], conditions: [] });
	}, []);

	return {
		showFilters,
		sortBy,
		sortOrder,
		filters,
		uniqueValues,
		filteredAndSortedSneakers,

		toggleFilters,
		toggleSort,
		updateFilter,
		clearFilters,
	};
}
