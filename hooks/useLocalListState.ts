import { useState, useMemo, useCallback } from 'react';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';

export type SortOption = 'name' | 'brand' | 'size' | 'condition' | 'value';

export interface Filter {
	brand?: SneakerBrand;
	size?: number;
	condition?: number;
	status?: SneakerStatus;
}

interface UniqueValues {
	brands: SneakerBrand[];
	sizes: number[];
	conditions: number[];
	statuses: SneakerStatus[];
}

export function useLocalListState(sneakers: Sneaker[]) {
	const [showFilters, setShowFilters] = useState(false);
	const [sortBy, setSortBy] = useState<SortOption>('name');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [filters, setFilters] = useState<Filter>({});
	const { currentUnit } = useSizeUnitStore();

	// Calculer les valeurs uniques pour les filtres
	const uniqueValues = useMemo((): UniqueValues => {
		if (!sneakers.length) {
			return { brands: [], sizes: [], conditions: [], statuses: [] };
		}

		return {
			brands: [...new Set(sneakers.map((s) => s.brand))],
			sizes: [
				...new Set(
					sneakers.map((s) =>
						currentUnit === 'EU' ? s.size_eu : s.size_us
					)
				),
			].sort((a, b) => a - b),
			conditions: [...new Set(sneakers.map((s) => s.condition))].sort(
				(a, b) => b - a
			),
			statuses: [...new Set(sneakers.map((s) => s.status))],
		};
	}, [sneakers, currentUnit]);

	// Filtrer les sneakers
	const filteredSneakers = useMemo(() => {
		let result = [...sneakers];

		if (filters.brand) {
			result = result.filter((s) => s.brand === filters.brand);
		}
		if (filters.size !== undefined) {
			result = result.filter(
				(s) =>
					(currentUnit === 'EU' ? s.size_eu : s.size_us) ===
					filters.size
			);
		}
		if (filters.condition !== undefined) {
			result = result.filter((s) => s.condition === filters.condition);
		}
		if (filters.status) {
			result = result.filter((s) => s.status === filters.status);
		}

		return result;
	}, [sneakers, filters, currentUnit]);

	// Trier les sneakers filtrés
	const filteredAndSortedSneakers = useMemo(() => {
		return [...filteredSneakers].sort((a, b) => {
			let aVal: any;
			let bVal: any;

			switch (sortBy) {
				case 'name':
					aVal = a.model.toLowerCase();
					bVal = b.model.toLowerCase();
					break;
				case 'brand':
					aVal = a.brand.toLowerCase();
					bVal = b.brand.toLowerCase();
					break;
				case 'size':
					aVal = currentUnit === 'EU' ? a.size_eu : a.size_us;
					bVal = currentUnit === 'EU' ? b.size_eu : b.size_us;
					break;
				case 'condition':
					aVal = a.condition;
					bVal = b.condition;
					break;
				case 'value':
					aVal = a.estimated_value;
					bVal = b.estimated_value;
					break;
				default:
					aVal = a.model.toLowerCase();
					bVal = b.model.toLowerCase();
			}

			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}, [filteredSneakers, sortBy, sortOrder, currentUnit]);

	// Actions
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
		// État
		showFilters,
		sortBy,
		sortOrder,
		filters,
		uniqueValues,
		filteredAndSortedSneakers,

		// Actions
		toggleFilters,
		toggleSort,
		updateFilter,
		clearFilters,
	};
}
