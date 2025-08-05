import { useCallback, useMemo, useState } from 'react';

import { SneakerFilterInterface } from '@/interfaces/SneakerFilterInterface';
import { sneakerFilteringProvider } from '@/src/domain/SneakerFiltering';
import { useSizeUnitStore } from '@/src/store/useSizeUnitStore';
import { UniqueValues } from '@/types/filter';
import { Filter, SortOption } from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

export function useSneakerFiltering(sneakers: Sneaker[]) {
	const [showFilters, setShowFilters] = useState(false);
	const [sortBy, setSortBy] = useState<SortOption>('name');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [filters, setFilters] = useState<Filter>({});
	const { currentUnit } = useSizeUnitStore();

	const uniqueValues = useMemo((): UniqueValues => {
		try {
			return SneakerFilterInterface.getUniqueValues(
				sneakers,
				currentUnit,
				sneakerFilteringProvider.getUniqueValues
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
			const filterState = {
				brands: filters.brand ? [filters.brand] : [],
				sizes: filters.size ? [filters.size.toString()] : [],
				conditions: filters.condition
					? [filters.condition.toString()]
					: [],
				statuses: filters.status ? [filters.status] : [],
			};

			return SneakerFilterInterface.filterSneakers(
				sneakers,
				filterState,
				currentUnit,
				sneakerFilteringProvider.filterSneakers
			);
		} catch (error) {
			console.error('❌ Error filtering sneakers:', error);
			return sneakers;
		}
	}, [sneakers, filters, currentUnit]);

	const filteredAndSortedSneakers = useMemo(() => {
		try {
			return SneakerFilterInterface.sortSneakers(
				filteredSneakers,
				sortBy,
				sortOrder,
				currentUnit,
				sneakerFilteringProvider.sortSneakers
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
