import { create } from 'zustand';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/Sneaker';

export type SortOption = 'name' | 'brand' | 'size' | 'condition' | 'price';

export interface Filter {
	brand?: SneakerBrand;
	size?: number;
	condition?: number;
	status?: SneakerStatus;
}

interface ListViewState {
	showFilters: boolean;

	sortBy: SortOption;
	sortOrder: 'asc' | 'desc';

	filters: Filter;

	originalSneakers: Sneaker[];
	filteredAndSortedSneakers: Sneaker[];
	uniqueValues: {
		brands: SneakerBrand[];
		sizes: number[];
		conditions: number[];
		statuses: SneakerStatus[];
	};

	toggleFilters: () => void;
	toggleSort: (option: SortOption) => void;
	updateFilter: (key: keyof Filter, value: any) => void;
	clearFilters: () => void;
	initializeData: (sneakers: Sneaker[]) => void;
}

const sortSneakers = (
	sneakers: Sneaker[],
	sortBy: SortOption,
	sortOrder: 'asc' | 'desc'
): Sneaker[] => {
	return [...sneakers].sort((a, b) => {
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
			default:
				aVal = a.model.toLowerCase();
				bVal = b.model.toLowerCase();
		}

		if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
		if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
		return 0;
	});
};

const filterSneakers = (sneakers: Sneaker[], filters: Filter): Sneaker[] => {
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
	if (filters.status) {
		result = result.filter((s) => s.status === filters.status);
	}
	return result;
};

const getUniqueValues = (sneakers: Sneaker[]) => ({
	brands: [...new Set(sneakers.map((s) => s.brand))],
	sizes: [...new Set(sneakers.map((s) => s.size))].sort((a, b) => a - b),
	conditions: [...new Set(sneakers.map((s) => s.condition))].sort(
		(a, b) => b - a
	),
	statuses: [...new Set(sneakers.map((s) => s.status))],
});

export const useListViewStore = create<ListViewState>((set, get) => ({
	showFilters: false,
	sortBy: 'name',
	sortOrder: 'asc',
	filters: {},
	originalSneakers: [],
	filteredAndSortedSneakers: [],
	uniqueValues: { brands: [], sizes: [], conditions: [], statuses: [] },

	toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

	toggleSort: (option: SortOption) => {
		set((state) => {
			const newSortOrder =
				state.sortBy === option
					? state.sortOrder === 'asc'
						? 'desc'
						: 'asc'
					: 'asc';
			const filtered = filterSneakers(
				state.originalSneakers,
				state.filters
			);
			const sorted = sortSneakers(filtered, option, newSortOrder);

			return {
				sortBy: option,
				sortOrder: newSortOrder,
				filteredAndSortedSneakers: sorted,
			};
		});
	},

	updateFilter: (key: keyof Filter, value: any) => {
		set((state) => {
			const newFilters = { ...state.filters, [key]: value };
			if (value === undefined) {
				delete newFilters[key];
			}

			const filtered = filterSneakers(state.originalSneakers, newFilters);
			const sorted = sortSneakers(
				filtered,
				state.sortBy,
				state.sortOrder
			);

			return {
				filters: newFilters,
				filteredAndSortedSneakers: sorted,
			};
		});
	},

	clearFilters: () => {
		set((state) => {
			const filtered = filterSneakers(state.originalSneakers, {});
			const sorted = sortSneakers(
				filtered,
				state.sortBy,
				state.sortOrder
			);
			return {
				filters: {},
				filteredAndSortedSneakers: sorted,
			};
		});
	},

	initializeData: (sneakers: Sneaker[]) => {
		const { sortBy, sortOrder, filters } = get();
		const uniqueValues = getUniqueValues(sneakers);
		const filtered = filterSneakers(sneakers, filters);
		const sorted = sortSneakers(filtered, sortBy, sortOrder);

		set({
			originalSneakers: sneakers,
			filteredAndSortedSneakers: sorted,
			uniqueValues,
		});
	},
}));
