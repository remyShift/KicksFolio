import { create } from 'zustand';
import { UserSearchService, SearchUser } from '@/services/UserSearchService';

interface UserSearchState {
	// State
	searchTerm: string;
	searchResults: SearchUser[];
	isLoading: boolean;
	hasMore: boolean;
	refreshing: boolean;
	page: number;

	// Actions
	setSearchTerm: (term: string) => void;
	setSearchResults: (results: SearchUser[]) => void;
	addSearchResults: (results: SearchUser[]) => void;
	setIsLoading: (loading: boolean) => void;
	setHasMore: (hasMore: boolean) => void;
	setRefreshing: (refreshing: boolean) => void;
	setPage: (page: number) => void;
	clearResults: () => void;
	reset: () => void;
}

const initialState = {
	searchTerm: '',
	searchResults: [],
	isLoading: false,
	hasMore: false,
	refreshing: false,
	page: 0,
};

export const useUserSearchStore = create<UserSearchState>((set) => ({
	...initialState,

	setSearchTerm: (term: string) => set({ searchTerm: term }),

	setSearchResults: (results: SearchUser[]) =>
		set({ searchResults: results }),

	addSearchResults: (results: SearchUser[]) =>
		set((state) => ({
			searchResults: [...state.searchResults, ...results],
		})),

	setIsLoading: (loading: boolean) => set({ isLoading: loading }),

	setHasMore: (hasMore: boolean) => set({ hasMore }),

	setRefreshing: (refreshing: boolean) => set({ refreshing }),

	setPage: (page: number) => set({ page }),

	clearResults: () =>
		set({
			searchResults: [],
			hasMore: false,
			page: 0,
		}),

	reset: () => set(initialState),
}));
