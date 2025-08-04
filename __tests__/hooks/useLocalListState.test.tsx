import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterState } from '@/hooks/useFilterState';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';

vi.mock('@/store/useSizeUnitStore', () => ({
	useSizeUnitStore: vi.fn(),
}));

const mockSneakerFilterProvider = vi.hoisted(() => ({
	getUniqueValues: vi.fn(),
	filterSneakers: vi.fn(),
	sortSneakers: vi.fn(),
}));

vi.mock('@/domain/SneakerFilterProvider', () => ({
	sneakerFilterProvider: mockSneakerFilterProvider,
}));

const mockSneakers: Sneaker[] = [
	{
		id: '1',
		model: 'Air Max 90',
		brand: 'nike' as SneakerBrand,
		size_eu: 42,
		size_us: 8.5,
		condition: 8,
		status: 'owned' as SneakerStatus,
		estimated_value: 150,
		price_paid: 120,
		user_id: 'user1',
		created_at: '2023-01-01',
		updated_at: '2023-01-01',
		images: [],
		description: 'Air Max 90',
	},
	{
		id: '2',
		model: 'Stan Smith',
		brand: 'adidas' as SneakerBrand,
		size_eu: 43,
		size_us: 9,
		condition: 9,
		status: 'wishlist' as SneakerStatus,
		estimated_value: 100,
		price_paid: 80,
		user_id: 'user1',
		created_at: '2023-01-02',
		updated_at: '2023-01-02',
		images: [],
		description: 'Stan Smith',
	},
];

describe('useFilterState', () => {
	const mockSizeUnitStore = {
		currentUnit: 'EU' as const,
	};

	beforeEach(() => {
		vi.mocked(useSizeUnitStore).mockReturnValue(mockSizeUnitStore);
		
		mockSneakerFilterProvider.getUniqueValues.mockReturnValue({
			brands: ['nike', 'adidas'],
			sizes: [42, 43],
			conditions: [8, 9],
			statuses: ['owned', 'wishlist'],
		});
		mockSneakerFilterProvider.filterSneakers.mockReturnValue(mockSneakers);
		mockSneakerFilterProvider.sortSneakers.mockReturnValue(mockSneakers);

		vi.clearAllMocks();
	});

	describe('initial state', () => {
		it('should have correct initial state', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			expect(result.current.showFilters).toBe(false);
			expect(result.current.sortBy).toBe('name');
			expect(result.current.sortOrder).toBe('asc');
			expect(result.current.filters).toEqual({});
		});

		it('should compute unique values using provider', () => {
			renderHook(() => useFilterState(mockSneakers));

			expect(mockSneakerFilterProvider.getUniqueValues).toHaveBeenCalledWith(mockSneakers, 'EU');
		});

		it('should compute filtered sneakers using provider', () => {
			renderHook(() => useFilterState(mockSneakers));

			expect(mockSneakerFilterProvider.filterSneakers).toHaveBeenCalledWith(mockSneakers, {}, 'EU');
		});

		it('should compute sorted sneakers using provider', () => {
			renderHook(() => useFilterState(mockSneakers));

			expect(mockSneakerFilterProvider.sortSneakers).toHaveBeenCalledWith(mockSneakers, 'name', 'asc', 'EU');
		});
	});

	describe('toggleFilters', () => {
		it('should toggle filter visibility', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			expect(result.current.showFilters).toBe(false);

			act(() => {
				result.current.toggleFilters();
			});

			expect(result.current.showFilters).toBe(true);

			act(() => {
				result.current.toggleFilters();
			});

			expect(result.current.showFilters).toBe(false);
		});
	});

	describe('toggleSort', () => {
		it('should change sort option and reset to asc', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			act(() => {
				result.current.toggleSort('brand');
			});

			expect(result.current.sortBy).toBe('brand');
			expect(result.current.sortOrder).toBe('asc');
		});

		it('should toggle sort order for same option', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			act(() => {
				result.current.toggleSort('name');
			});

			expect(result.current.sortBy).toBe('name');
			expect(result.current.sortOrder).toBe('desc');

			act(() => {
				result.current.toggleSort('name');
			});

			expect(result.current.sortOrder).toBe('asc');
		});
	});

	describe('updateFilter', () => {
		it('should add filter', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			act(() => {
				result.current.updateFilter('brand', 'nike');
			});

			expect(result.current.filters).toEqual({ brand: 'nike' });
		});

		it('should remove filter when value is undefined', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			act(() => {
				result.current.updateFilter('brand', 'nike');
			});

			expect(result.current.filters).toEqual({ brand: 'nike' });

			act(() => {
				result.current.updateFilter('brand', undefined);
			});

			expect(result.current.filters).toEqual({});
		});

		it('should update multiple filters', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			act(() => {
				result.current.updateFilter('brand', 'nike');
				result.current.updateFilter('condition', 8);
			});

			expect(result.current.filters).toEqual({ brand: 'nike', condition: 8 });
		});
	});

	describe('clearFilters', () => {
		it('should clear all filters', () => {
			const { result } = renderHook(() => useFilterState(mockSneakers));

			act(() => {
				result.current.updateFilter('brand', 'nike');
				result.current.updateFilter('condition', 8);
			});

			expect(result.current.filters).toEqual({ brand: 'nike', condition: 8 });

			act(() => {
				result.current.clearFilters();
			});

			expect(result.current.filters).toEqual({});
		});
	});

	describe('error handling', () => {
		it('should handle getUniqueValues error gracefully', () => {
			mockSneakerFilterProvider.getUniqueValues.mockImplementation(() => {
				throw new Error('Provider error');
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { result } = renderHook(() => useFilterState(mockSneakers));

			expect(result.current.uniqueValues).toEqual({
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			});
			expect(consoleSpy).toHaveBeenCalledWith('❌ Error getting unique values:', expect.any(Error));

			consoleSpy.mockRestore();
		});

		it('should handle filterSneakers error gracefully', () => {
			mockSneakerFilterProvider.filterSneakers.mockImplementation(() => {
				throw new Error('Filter error');
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { result } = renderHook(() => useFilterState(mockSneakers));

			expect(result.current.filteredAndSortedSneakers).toBe(mockSneakers);
			expect(consoleSpy).toHaveBeenCalledWith('❌ Error filtering sneakers:', expect.any(Error));

			consoleSpy.mockRestore();
		});

		it('should handle sortSneakers error gracefully', () => {
			mockSneakerFilterProvider.sortSneakers.mockImplementation(() => {
				throw new Error('Sort error');
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { result } = renderHook(() => useFilterState(mockSneakers));

			expect(consoleSpy).toHaveBeenCalledWith('❌ Error sorting sneakers:', expect.any(Error));

			consoleSpy.mockRestore();
		});
	});
});