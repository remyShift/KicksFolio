import { useState, useMemo } from 'react';
import { Sneaker, SneakerBrand } from '@/types/sneaker';

export type SortOption =
	| 'name'
	| 'brand'
	| 'size'
	| 'condition'
	| 'price'
	| 'date';

export interface Filter {
	brand?: SneakerBrand;
	size?: number;
	condition?: number;
}

export function useSneakersFiltering(sneakers: Sneaker[]) {
	const [sortBy, setSortBy] = useState<SortOption>('name');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const [filters, setFilters] = useState<Filter>({});

	const uniqueValues = useMemo(
		() => ({
			brands: [...new Set(sneakers.map((s) => s.brand))],
			sizes: [...new Set(sneakers.map((s) => s.size))].sort(
				(a, b) => a - b
			),
			conditions: [...new Set(sneakers.map((s) => s.condition))].sort(
				(a, b) => b - a
			),
		}),
		[sneakers]
	);

	const filteredAndSortedSneakers = useMemo(() => {
		let result = [...sneakers];

		if (filters.brand) {
			result = result.filter((s) => s.brand === filters.brand);
		}
		if (filters.size) {
			result = result.filter((s) => s.size === filters.size);
		}
		if (filters.condition) {
			result = result.filter((s) => s.condition === filters.condition);
		}

		result.sort((a, b) => {
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
					aVal = a.size;
					bVal = b.size;
					break;
				case 'condition':
					aVal = a.condition;
					bVal = b.condition;
					break;
				case 'price':
					aVal = a.price_paid;
					bVal = b.price_paid;
					break;
				case 'date':
					aVal = new Date(a.created_at);
					bVal = new Date(b.created_at);
					break;
				default:
					aVal = a.model.toLowerCase();
					bVal = b.model.toLowerCase();
			}

			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		return result;
	}, [sneakers, filters, sortBy, sortOrder]);

	const toggleSort = (option: SortOption) => {
		if (sortBy === option) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(option);
			setSortOrder('asc');
		}
	};

	const updateFilter = (key: keyof Filter, value: any) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const clearFilters = () => {
		setFilters({});
	};

	return {
		filteredAndSortedSneakers,
		uniqueValues,

		sortBy,
		sortOrder,
		filters,

		toggleSort,
		updateFilter,
		clearFilters,
	};
}
