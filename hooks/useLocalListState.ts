import { useState, useMemo, useCallback } from 'react';
import { Sneaker } from '@/types/sneaker';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { UniqueValues } from '@/interfaces/SneakerFilterInterface';
import { sneakerFilterProvider } from '@/domain/SneakerFiltering';
import { Filter, SortOption } from '@/types/filter';

export function useLocalListState(sneakers: Sneaker[]) {
	const [showFilters, setShowFilters] = useState(false);
	const [sortBy, setSortBy] = useState<SortOption>('name');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [filters, setFilters] = useState<Filter>({});
	const { currentUnit } = useSizeUnitStore();

	const uniqueValues = useMemo((): UniqueValues => {
		try {
			return sneakerFilterProvider.getUniqueValues(sneakers, currentUnit);
		} catch (error) {
			console.error('❌ Error getting unique values:', error);
			return { brands: [], sizes: [], conditions: [], statuses: [] };
		}
	}, [sneakers, currentUnit]);

	const filteredSneakers = useMemo(() => {
		try {
			return sneakerFilterProvider.filterSneakers(
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
			return sneakerFilterProvider.sortSneakers(
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

	const updateFilter = useCallback((key: keyof Filter, value: any) => {
		setFilters((prev) => {
			const newFilters = { ...prev };
			if (value === undefined) {
				delete newFilters[key];
			} else {
				newFilters[key] = value;
			}
			return newFilters;
		});
	}, []);

	const clearFilters = useCallback(() => {
		setFilters({});
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
