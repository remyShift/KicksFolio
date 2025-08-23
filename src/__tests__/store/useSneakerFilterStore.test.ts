import { act, renderHook } from '@testing-library/react';

import { useSneakerFilterStore } from '@/store/useSneakerFilterStore';
import { BrandId, Sneaker, SneakerStatus } from '@/types/sneaker';

describe('useSneakerFilterStore', () => {
	const mockSneakers: Sneaker[] = [
		{
			id: '1',
			model: 'Air Force 1',
			brand_id: BrandId.Nike,
			size_eu: 42,
			size_us: 8.5,
			condition: 8,
			status_id: SneakerStatus.STOCKING,
			description: 'Great condition',
			images: [],
			user_id: 'user1',
			estimated_value: 150,
		},
		{
			id: '2',
			model: 'Stan Smith',
			brand_id: BrandId.Adidas,
			size_eu: 43,
			size_us: 8.5,
			condition: 9,
			status_id: SneakerStatus.STOCKING,
			description: 'Great condition',
			images: [],
			user_id: 'user1',
			estimated_value: 150,
		},
	];

	beforeEach(() => {
		const { result } = renderHook(() => useSneakerFilterStore());
		act(() => {
			result.current.setSneakers([]);
			result.current.clearFilters();
		});
	});

	describe('Initial state', () => {
		it('should have correct initial values', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

			expect(result.current.sneakers).toEqual([]);
			expect(result.current.sortBy).toBe('name');
			expect(result.current.sortOrder).toBe('asc');
			expect(result.current.showFilters).toBe(false);
			expect(result.current.filters).toEqual({
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			});
			expect(result.current.filteredAndSortedSneakers).toEqual([]);
		});
	});

	describe('setSneakers', () => {
		it('should update sneakers and derived data', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

			act(() => {
				result.current.setSneakers(mockSneakers);
			});

			expect(result.current.sneakers).toEqual(mockSneakers);
			expect(result.current.filteredAndSortedSneakers).toEqual(
				mockSneakers
			);
			expect(result.current.uniqueValues.brands).toContain('Nike');
			expect(result.current.uniqueValues.brands).toContain('Adidas');
		});
	});

	describe('toggleSort', () => {
		beforeEach(() => {
			const { result } = renderHook(() => useSneakerFilterStore());
			act(() => {
				result.current.setSneakers(mockSneakers);
			});
		});

		it('should toggle sort order when same option selected', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

			expect(result.current.sortBy).toBe('name');
			expect(result.current.sortOrder).toBe('asc');

			act(() => {
				result.current.toggleSort('name');
			});

			expect(result.current.sortBy).toBe('name');
			expect(result.current.sortOrder).toBe('desc');
		});

		it('should change sort option and reset to asc', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

			act(() => {
				result.current.toggleSort('brand');
			});

			expect(result.current.sortBy).toBe('brand');
			expect(result.current.sortOrder).toBe('asc');
		});
	});

	describe('toggleFilters', () => {
		it('should toggle showFilters state', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

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

	describe('updateFilter', () => {
		beforeEach(() => {
			const { result } = renderHook(() => useSneakerFilterStore());
			act(() => {
				result.current.setSneakers(mockSneakers);
			});
		});

		it('should update filter and recalculate filtered data', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

			act(() => {
				result.current.updateFilter('brands', ['Nike']);
			});

			expect(result.current.filters.brands).toEqual(['Nike']);
			expect(result.current.filteredAndSortedSneakers.length).toBe(1);
			expect(result.current.filteredAndSortedSneakers[0].brand_id).toBe(
				BrandId.Nike
			);
		});
	});

	describe('clearFilters', () => {
		it('should clear all filters and recalculate data', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

			act(() => {
				result.current.setSneakers(mockSneakers);
				result.current.updateFilter('brands', ['Nike']);
			});

			expect(result.current.filters.brands).toEqual(['Nike']);

			act(() => {
				result.current.clearFilters();
			});

			expect(result.current.filters).toEqual({
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			});
			expect(result.current.filteredAndSortedSneakers).toHaveLength(
				mockSneakers.length
			);
		});
	});

	describe('Integration with domain layer', () => {
		it('should use domain methods when updating derived data', () => {
			const { result } = renderHook(() => useSneakerFilterStore());

			act(() => {
				result.current.setSneakers(mockSneakers);
			});

			expect(result.current.uniqueValues.brands).toContain('Nike');
			expect(result.current.uniqueValues.brands).toContain('Adidas');
			expect(result.current.filteredAndSortedSneakers).toHaveLength(2);
			expect(
				result.current.filteredAndSortedSneakers.map((s) => s.id)
			).toEqual(expect.arrayContaining(['1', '2']));
		});
	});
});
