import { useCallback, useMemo, useState } from 'react';

import { sneakerFilteringProvider } from '@/d/SneakerFiltering';
import { SneakerFilterInterface } from '@/domain/SneakerFilterInterface';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { FilterState, SortOption, SortOrder } from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

interface UseLocalSneakerDataReturn {
	filteredAndSortedSneakers: Sneaker[];
	uniqueValues: {
		brands: string[];
		sizes: string[];
		conditions: string[];
		statuses: string[];
	};
	sortBy: SortOption;
	sortOrder: SortOrder;
	showFilters: boolean;
	filters: FilterState;
	toggleSort: (option: SortOption) => void;
	toggleFilters: () => void;
	updateFilter: (filterType: keyof FilterState, values: string[]) => void;
	clearFilters: () => void;
}

export function useLocalSneakerData(
	sneakers: Sneaker[]
): UseLocalSneakerDataReturn {
	const { currentUnit } = useSizeUnitStore();

	const [sortBy, setSortBy] = useState<SortOption>('name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<FilterState>({
		brands: [],
		sizes: [],
		conditions: [],
		statuses: [],
	});

	const filteredAndSortedSneakers = useMemo(() => {
		const filteredSneakers = SneakerFilterInterface.filterSneakers(
			sneakers,
			filters,
			currentUnit,
			sneakerFilteringProvider.filterSneakers
		);

		return SneakerFilterInterface.sortSneakers(
			filteredSneakers,
			sortBy,
			sortOrder,
			currentUnit,
			sneakerFilteringProvider.sortSneakers
		);
	}, [sneakers, filters, sortBy, sortOrder, currentUnit]);

	const uniqueValues = useMemo(() => {
		return SneakerFilterInterface.getUniqueValues(
			sneakers,
			currentUnit,
			sneakerFilteringProvider.getUniqueValues
		);
	}, [sneakers, currentUnit]);

	const toggleSort = useCallback(
		(option: SortOption) => {
			setSortBy(option);
			setSortOrder((prev) =>
				prev === 'asc' && sortBy === option ? 'desc' : 'asc'
			);
		},
		[sortBy]
	);

	const toggleFilters = useCallback(() => {
		setShowFilters((prev) => !prev);
	}, []);

	const updateFilter = useCallback(
		(filterType: keyof FilterState, values: string[]) => {
			setFilters((prev) => ({
				...prev,
				[filterType]: values,
			}));
		},
		[]
	);

	const clearFilters = useCallback(() => {
		setFilters({
			brands: [],
			sizes: [],
			conditions: [],
			statuses: [],
		});
	}, []);

	return {
		filteredAndSortedSneakers,
		uniqueValues,
		sortBy,
		sortOrder,
		showFilters,
		filters,
		toggleSort,
		toggleFilters,
		updateFilter,
		clearFilters,
	};
}
