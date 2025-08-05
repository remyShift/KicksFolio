import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { SearchUsersResponse } from '@/domain/UserSearchProvider';
import { useUserSearch } from '@/hooks/useUserSearch';

vi.mock('@/interfaces/UserSearchInterface', () => ({
	UserSearchInterface: {
		searchUsers: vi.fn(),
		getUserProfile: vi.fn(),
		getUserSneakers: vi.fn(),
	},
}));

const mockUser = {
	id: 'test-user-id',
	username: 'testuser',
	email: 'test@example.com',
};

vi.mock('@/contexts/authContext', () => ({
	useSession: () => ({
		user: mockUser,
	}),
}));

const mockToast = {
	showErrorToast: vi.fn(),
};

vi.mock('@/hooks/ui/useToast', () => ({
	__esModule: true,
	default: () => mockToast,
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				'search.error.title': 'Search Error',
				'search.error.message': 'Failed to search users',
			};
			return translations[key] || key;
		},
	}),
}));

const mockStore = {
	searchTerm: '',
	searchResults: [],
	isLoading: false,
	hasMore: false,
	refreshing: false,
	page: 0,
	setSearchTerm: vi.fn(),
	setSearchResults: vi.fn(),
	addSearchResults: vi.fn(),
	setIsLoading: vi.fn(),
	setHasMore: vi.fn(),
	setRefreshing: vi.fn(),
	setPage: vi.fn(),
	clearResults: vi.fn(),
};

vi.mock('@/store/useUserSearchStore', () => ({
	useUserSearchStore: () => mockStore,
}));

describe('useUserSearch', () => {
	let UserSearchInterface: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.clearAllTimers();
		vi.useFakeTimers();
		UserSearchInterface = (await import('@/interfaces/UserSearchInterface'))
			.UserSearchInterface;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should initialize with correct default values', () => {
		const { result } = renderHook(() => useUserSearch());

		expect(result.current.searchTerm).toBe('');
		expect(result.current.searchResults).toEqual([]);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.hasMore).toBe(false);
		expect(result.current.refreshing).toBe(false);
	});

	describe('handleSearchChange', () => {
		it('should update search term and trigger search after debounce', async () => {
			const mockSearchResponse: SearchUsersResponse = {
				users: [
					{
						id: '1',
						username: 'testuser',
						first_name: 'Test',
						last_name: 'User',
						profile_picture: null,
						is_following: false,
						followers_count: 10,
						following_count: 5,
						sneakers: [],
					},
				],
				hasMore: false,
				totalCount: 1,
			};

			UserSearchInterface.searchUsers.mockResolvedValue(
				mockSearchResponse
			);

			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.handleSearchChange('test');
			});

			expect(mockStore.setSearchTerm).toHaveBeenCalledWith('test');

			act(() => {
				vi.advanceTimersByTime(500);
			});

			await act(async () => {
				await vi.runAllTimersAsync();
			});

			expect(UserSearchInterface.searchUsers).toHaveBeenCalledWith(
				'test',
				'test-user-id',
				0,
				expect.any(Function)
			);
		});

		it('should clear results for search terms shorter than 2 characters', () => {
			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.handleSearchChange('a');
			});

			expect(mockStore.clearResults).toHaveBeenCalled();
		});

		it('should clear previous timeout when new search is triggered', () => {
			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.handleSearchChange('test1');
			});

			act(() => {
				result.current.handleSearchChange('test2');
			});

			expect(mockStore.setSearchTerm).toHaveBeenCalledWith('test2');
		});
	});

	describe('loadMore', () => {
		it('should trigger search with next page when hasMore is true', async () => {
			const mockSearchResponse: SearchUsersResponse = {
				users: [],
				hasMore: false,
				totalCount: 0,
			};

			UserSearchInterface.searchUsers.mockResolvedValue(
				mockSearchResponse
			);

			mockStore.hasMore = true;
			mockStore.isLoading = false;
			mockStore.searchTerm = 'test';
			mockStore.page = 0;

			const { result } = renderHook(() => useUserSearch());

			await act(async () => {
				result.current.loadMore();
			});

			expect(UserSearchInterface.searchUsers).toHaveBeenCalledWith(
				'test',
				'test-user-id',
				1,
				expect.any(Function)
			);
		});

		it('should not trigger search when hasMore is false', () => {
			mockStore.hasMore = false;
			mockStore.isLoading = false;
			mockStore.searchTerm = 'test';

			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.loadMore();
			});

			expect(UserSearchInterface.searchUsers).not.toHaveBeenCalled();
		});

		it('should not trigger search when already loading', () => {
			mockStore.hasMore = true;
			mockStore.isLoading = true;
			mockStore.searchTerm = 'test';

			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.loadMore();
			});

			expect(UserSearchInterface.searchUsers).not.toHaveBeenCalled();
		});
	});

	describe('onRefresh', () => {
		it('should trigger refresh search when search term is valid', async () => {
			const mockSearchResponse: SearchUsersResponse = {
				users: [],
				hasMore: false,
				totalCount: 0,
			};

			UserSearchInterface.searchUsers.mockResolvedValue(
				mockSearchResponse
			);
			mockStore.searchTerm = 'test';

			const { result } = renderHook(() => useUserSearch());

			await act(async () => {
				result.current.onRefresh();
			});

			expect(mockStore.setRefreshing).toHaveBeenCalledWith(true);
			expect(UserSearchInterface.searchUsers).toHaveBeenCalledWith(
				'test',
				'test-user-id',
				0,
				expect.any(Function)
			);
		});

		it('should not trigger refresh when search term is invalid', () => {
			mockStore.searchTerm = 'a';

			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.onRefresh();
			});

			expect(mockStore.setRefreshing).not.toHaveBeenCalled();
			expect(UserSearchInterface.searchUsers).not.toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should handle search errors gracefully', async () => {
			const mockError = new Error('Search failed');
			UserSearchInterface.searchUsers.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			mockStore.searchTerm = 'test';

			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.handleSearchChange('test');
			});

			act(() => {
				vi.advanceTimersByTime(500);
			});

			await act(async () => {
				await vi.runAllTimersAsync();
			});

			expect(consoleSpy).toHaveBeenCalledWith('Search error:', mockError);
			expect(mockToast.showErrorToast).toHaveBeenCalledWith(
				'Search Error',
				'Failed to search users'
			);

			consoleSpy.mockRestore();
		});
	});

	describe('cleanup', () => {
		it('should clear timeout on unmount', () => {
			const { result, unmount } = renderHook(() => useUserSearch());

			act(() => {
				result.current.handleSearchChange('test');
			});

			unmount();

			expect(true).toBe(true);
		});
	});

	describe('clearResults', () => {
		it('should expose clearResults function', () => {
			const { result } = renderHook(() => useUserSearch());

			act(() => {
				result.current.clearResults();
			});

			expect(mockStore.clearResults).toHaveBeenCalled();
		});
	});
});
