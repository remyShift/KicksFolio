import { useCallback, useRef, useEffect } from 'react';
import { UserSearchService } from '@/services/UserSearchService';
import { useSession } from '@/context/authContext';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { useUserSearchStore } from '@/store/useUserSearchStore';

interface UseUserSearchReturn {
	// State from store
	searchTerm: string;
	searchResults: any[];
	isLoading: boolean;
	hasMore: boolean;
	refreshing: boolean;

	// Actions
	handleSearchChange: (term: string) => void;
	loadMore: () => void;
	onRefresh: () => void;
	clearResults: () => void;
}

export const useUserSearch = (): UseUserSearchReturn => {
	const { user } = useSession();
	const { showErrorToast } = useToast();
	const { t } = useTranslation();

	// Store state and actions
	const {
		searchTerm,
		searchResults,
		isLoading,
		hasMore,
		refreshing,
		page,
		setSearchTerm,
		setSearchResults,
		addSearchResults,
		setIsLoading,
		setHasMore,
		setRefreshing,
		setPage,
		clearResults,
	} = useUserSearchStore();

	const debounceRef = useRef<number | undefined>(undefined);

	const performSearch = useCallback(
		async (
			term: string,
			pageNum: number = 0,
			isRefresh: boolean = false
		) => {
			if (!user?.id || term.trim().length < 2) {
				if (isRefresh) {
					clearResults();
				}
				return;
			}

			setIsLoading(true);

			try {
				const result = await UserSearchService.searchUsers(
					term.trim(),
					user.id,
					pageNum
				);

				if (pageNum === 0 || isRefresh) {
					setSearchResults(result.users);
				} else {
					addSearchResults(result.users);
				}

				setHasMore(result.hasMore);
				setPage(pageNum);
			} catch (error) {
				console.error('Search error:', error);
				showErrorToast(
					t('search.error.title'),
					t('search.error.message')
				);
			} finally {
				setIsLoading(false);
				setRefreshing(false);
			}
		},
		[
			user?.id,
			showErrorToast,
			t,
			clearResults,
			setSearchResults,
			addSearchResults,
			setIsLoading,
			setHasMore,
			setPage,
			setRefreshing,
		]
	);

	const handleSearchChange = useCallback(
		(term: string) => {
			setSearchTerm(term);

			// Clear previous debounce
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			if (term.trim().length >= 2) {
				debounceRef.current = setTimeout(() => {
					performSearch(term, 0, true);
				}, 500);
			} else {
				clearResults();
			}
		},
		[performSearch, setSearchTerm, clearResults]
	);

	const loadMore = useCallback(() => {
		if (hasMore && !isLoading && searchTerm.trim().length >= 2) {
			performSearch(searchTerm, page + 1);
		}
	}, [hasMore, isLoading, searchTerm, page, performSearch]);

	const onRefresh = useCallback(() => {
		if (searchTerm.trim().length >= 2) {
			setRefreshing(true);
			performSearch(searchTerm, 0, true);
		}
	}, [searchTerm, performSearch, setRefreshing]);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	return {
		searchTerm,
		searchResults,
		isLoading,
		hasMore,
		refreshing,
		handleSearchChange,
		loadMore,
		onRefresh,
		clearResults,
	};
};
