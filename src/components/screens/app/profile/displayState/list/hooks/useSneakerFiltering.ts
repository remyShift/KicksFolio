import { useCallback, useMemo, useRef, useState } from 'react';

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

	const prevSneakersRef = useRef<Sneaker[]>([]);
	const prevFiltersRef = useRef<FilterState>(filters);
	const prevSortRef = useRef<{ sortBy: SortOption; sortOrder: SortOrder }>({
		sortBy,
		sortOrder,
	});

	const filteredSneakers = useMemo(() => {
		const sneakersChanged = prevSneakersRef.current !== sneakers;
		const filtersChanged =
			JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);

		if (sneakersChanged || filtersChanged) {
			prevSneakersRef.current = sneakers;
			prevFiltersRef.current = filters;

			return SneakerFilterInterface.filterSneakers(
				sneakers,
				filters,
				currentUnit,
				sneakerFilteringProvider.filterSneakers
			);
		}

		return SneakerFilterInterface.filterSneakers(
			prevSneakersRef.current,
			prevFiltersRef.current,
			currentUnit,
			sneakerFilteringProvider.filterSneakers
		);
	}, [sneakers, filters, currentUnit]);

	const filteredAndSortedSneakers = useMemo(() => {
		const sortChanged =
			prevSortRef.current.sortBy !== sortBy ||
			prevSortRef.current.sortOrder !== sortOrder;

		if (sortChanged) {
			prevSortRef.current = { sortBy, sortOrder };
		}

		return SneakerFilterInterface.sortSneakers(
			filteredSneakers,
			sortBy,
			sortOrder,
			currentUnit,
			sneakerFilteringProvider.sortSneakers
		);
	}, [filteredSneakers, sortBy, sortOrder, currentUnit]);

	const uniqueValues = useMemo(() => {
		const sneakersChanged = prevSneakersRef.current !== sneakers;

		if (sneakersChanged) {
			return SneakerFilterInterface.getUniqueValues(
				sneakers,
				currentUnit,
				sneakerFilteringProvider.getUniqueValues
			);
		}

		return SneakerFilterInterface.getUniqueValues(
			prevSneakersRef.current,
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

	return useMemo(
		() => ({
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
		}),
		[
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
		]
	);
}
