import { create } from 'zustand';
import { Sneaker } from '@/types/Sneaker';
import { SortOption, SortOrder, FilterState } from '@/types/filter';
import { sneakerFilterProvider } from '@/domain/SneakerFiltering';

interface SneakerFilterStore {
	// État
	sneakers: Sneaker[];
	sortBy: SortOption;
	sortOrder: SortOrder;
	showFilters: boolean;
	filters: FilterState;

	// Données dérivées
	filteredAndSortedSneakers: Sneaker[];
	uniqueValues: {
		brands: string[];
		sizes: string[];
		conditions: string[];
	};

	// Actions
	setSneakers: (sneakers: Sneaker[]) => void;
	toggleSort: (option: SortOption) => void;
	toggleFilters: () => void;
	updateFilter: (filterType: keyof FilterState, values: string[]) => void;
	clearFilters: () => void;

	// Actions internes
	_updateDerivedData: () => void;
}

export const useSneakerFilterStore = create<SneakerFilterStore>((set, get) => ({
	// État initial
	sneakers: [],
	sortBy: 'name',
	sortOrder: 'asc',
	showFilters: false,
	filters: {
		brands: [],
		sizes: [],
		conditions: [],
	},

	// Données dérivées initiales
	filteredAndSortedSneakers: [],
	uniqueValues: {
		brands: [],
		sizes: [],
		conditions: [],
	},

	// Actions
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

	// Action interne pour mettre à jour les données dérivées
	_updateDerivedData: () => {
		const state = get();

		// Utilisation du domain layer pour la logique métier
		const filteredAndSortedSneakers =
			sneakerFilterProvider.filterAndSortSneakers(
				state.sneakers,
				state.filters,
				state.sortBy,
				state.sortOrder
			);

		const uniqueValues = sneakerFilterProvider.getUniqueValues(
			state.sneakers
		);

		set({
			filteredAndSortedSneakers,
			uniqueValues,
		});
	},
}));
