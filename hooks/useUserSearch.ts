import { useCallback, useRef, useEffect } from 'react';
import { SearchUser } from '@/domain/UserSearchProvider';
import { useSession } from '@/context/authContext';
import useToast from '@/hooks/ui/useToast';
import { useTranslation } from 'react-i18next';
import { useUserSearchStore } from '@/store/useUserSearchStore';
import { UserSearchInterface } from '@/interfaces/UserSearchInterface';
import { userSearchProvider } from '@/domain/UserSearchProvider';

interface UseUserSearchReturn {
	searchTerm: string;
	searchResults: SearchUser[];
	isLoading: boolean;
	hasMore: boolean;
	refreshing: boolean;

	handleSearchChange: (term: string) => void;
	loadMore: () => void;
	onRefresh: () => void;
	clearResults: () => void;
}

export const useUserSearch = (): UseUserSearchReturn => {
	const { user } = useSession();
	const { showErrorToast } = useToast();
	const { t } = useTranslation();

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

			return UserSearchInterface.searchUsers(
				term.trim(),
				user.id,
				pageNum,
				userSearchProvider.searchUsers
			)
				.then((result) => {
					if (pageNum === 0 || isRefresh) {
						setSearchResults(result.users);
					} else {
						addSearchResults(result.users);
					}

					setHasMore(result.hasMore);
					setPage(pageNum);
				})
				.catch((error) => {
					console.error('Search error:', error);
					showErrorToast(
						t('search.error.title'),
						t('search.error.message')
					);
				})
				.finally(() => {
					setIsLoading(false);
					setRefreshing(false);
				});
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
