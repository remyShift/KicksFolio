import { create } from 'zustand';

import { sneakerFilteringProvider } from '@/d/SneakerFiltering';
import { SneakerFilterInterface } from '@/domain/SneakerFilterInterface';
import { FilterState, SortOption, SortOrder } from '@/types/filter';
import { SizeUnit, Sneaker } from '@/types/sneaker';

import { useSizeUnitStore } from './useSizeUnitStore';

interface SneakerFilterStore {
	sneakers: Sneaker[];
	sortBy: SortOption;
	sortOrder: SortOrder;
	showFilters: boolean;
	filters: FilterState;

	filteredAndSortedSneakers: Sneaker[];
	uniqueValues: {
		brands: string[];
		sizes: string[];
		conditions: string[];
		statuses: string[];
	};

	setSneakers: (sneakers: Sneaker[]) => void;
	toggleSort: (option: SortOption) => void;
	toggleFilters: () => void;
	updateFilter: (filterType: keyof FilterState, values: string[]) => void;
	clearFilters: () => void;

	_updateDerivedData: () => void;
	currentUnit: SizeUnit;
}

export const useSneakerFilterStore = create<SneakerFilterStore>((set, get) => ({
	sneakers: [],
	sortBy: 'name',
	sortOrder: 'asc',
	showFilters: false,
	filters: {
		brands: [],
		sizes: [],
		conditions: [],
	},

	currentUnit: useSizeUnitStore.getState().currentUnit,

	filteredAndSortedSneakers: [],
	uniqueValues: {
		brands: [],
		sizes: [],
		conditions: [],
		statuses: [],
	},

	setSneakers: (sneakers: Sneaker[]) => {
		set({ sneakers });
		get()._updateDerivedData();
	},

	toggleSort: (option: SortOption) => {
		const state = get();
		const newSortOrder =
			state.sortBy === option && state.sortOrder === 'asc'
				? 'desc'
				: 'asc';

		set({
			sortBy: option,
			sortOrder: newSortOrder,
		});
		get()._updateDerivedData();
	},

	toggleFilters: () => {
		set((state) => ({ showFilters: !state.showFilters }));
	},

	updateFilter: (filterType: keyof FilterState, values: string[]) => {
		set((state) => ({
			filters: {
				...state.filters,
				[filterType]: values,
			},
		}));
		get()._updateDerivedData();
	},

	clearFilters: () => {
		set({
			filters: {
				brands: [],
				sizes: [],
				conditions: [],
			},
		});
		get()._updateDerivedData();
	},

	_updateDerivedData: () => {
		const state = get();

		const filteredSneakers = SneakerFilterInterface.filterSneakers(
			state.sneakers,
			state.filters,
			state.currentUnit,
			sneakerFilteringProvider.filterSneakers
		);

		const filteredAndSortedSneakers = SneakerFilterInterface.sortSneakers(
			filteredSneakers,
			state.sortBy,
			state.sortOrder,
			state.currentUnit,
			sneakerFilteringProvider.sortSneakers
		);

		const uniqueValues = SneakerFilterInterface.getUniqueValues(
			state.sneakers,
			state.currentUnit,
			sneakerFilteringProvider.getUniqueValues
		);

		set({
			filteredAndSortedSneakers,
			uniqueValues,
		});
	},
}));
