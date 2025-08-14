import { useCallback, useMemo, useState } from 'react';

import { sneakerFilteringProvider } from '@/d/SneakerFiltering';
import { SneakerFilterInterface } from '@/domain/SneakerFilterInterface';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { FilterState, SortOption, SortOrder } from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

interface UseLocalSneakerFilteringProps {
	sneakers: Sneaker[];
}

export function useSneakerFiltering({
	sneakers,
}: UseLocalSneakerFilteringProps) {
	const [sortBy, setSortBy] = useState<SortOption>('name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<FilterState>({
		brands: [],
		sizes: [],
		conditions: [],
		statuses: [],
	});

	const { currentUnit } = useSizeUnitStore();

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
			setSortOrder((prevOrder) =>
				sortBy === option && prevOrder === 'asc' ? 'desc' : 'asc'
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
