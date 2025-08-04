import { renderHook, act } from '@testing-library/react';
import { useSneakerFilterStore } from '@/store/useSneakerFilterStore';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { vi } from 'vitest';

vi.mock('@/domain/SneakerFiltering', () => ({
	sneakerFilteringProvider: {
		filterSneakers: vi.fn((sneakers, filters, currentUnit) => {
			let result = [...sneakers];

			if (filters.brands && filters.brands.length > 0) {
				result = result.filter((s) => filters.brands.includes(s.brand));
			}

			return result;
		}),
		sortSneakers: vi.fn((sneakers, sortBy, sortOrder, currentUnit) => {
			let result = [...sneakers];

			result.sort((a, b) => {
				let comparison = 0;
				if (sortBy === 'name') {
					comparison = a.model.localeCompare(b.model);
				} else if (sortBy === 'brand') {
					comparison = a.brand.localeCompare(b.brand);
				}
				return sortOrder === 'desc' ? -comparison : comparison;
			});

			return result;
		}),
		getUniqueValues: vi.fn((sneakers, currentUnit) => ({
			brands: [...new Set(sneakers.map((s) => s.brand))],
			sizes: [
				...new Set(
					sneakers
						.map((s: Sneaker) => {
							const size =
								currentUnit === 'US' ? s.size_us : s.size_eu;
							return size?.toString();
						})
						.filter(Boolean)
				),
			],
			conditions: [
				...new Set(
					sneakers
						.map((s: Sneaker) => s.condition?.toString())
						.filter(Boolean)
				),
			],
			statuses: [
				...new Set(
					sneakers.map((s: Sneaker) => s.status).filter(Boolean)
				),
			],
		})),
	},
}));

vi.mock('@/interfaces/SneakerFilterInterface', () => ({
	SneakerFilterInterface: {
		filterSneakers: vi.fn(
			(sneakers, filters, currentUnit, filterFunction) => {
				return filterFunction(sneakers, filters, currentUnit);
			}
		),
		sortSneakers: vi.fn(
			(sneakers, sortBy, sortOrder, currentUnit, sortFunction) => {
				return sortFunction(sneakers, sortBy, sortOrder, currentUnit);
			}
		),
		getUniqueValues: vi.fn((sneakers, currentUnit, getUniqueFunction) => {
			return getUniqueFunction(sneakers, currentUnit);
		}),
	},
}));

describe('useSneakerFilterStore', () => {
	const mockSneakers: Sneaker[] = [
		{
			id: '1',
			model: 'Air Force 1',
			brand: SneakerBrand.Nike,
			size_eu: 42,
			size_us: 8.5,
			condition: 8,
			status: SneakerStatus.Stocking,
			description: 'Great condition',
			updated_at: '2024-01-01',
			images: [],
			created_at: '2024-01-01',
			user_id: 'user1',
			estimated_value: 150,
		},
		{
			id: '2',
			model: 'Stan Smith',
			brand: SneakerBrand.Adidas,
			size_eu: 43,
			size_us: 8.5,
			condition: 9,
			status: SneakerStatus.Stocking,
			description: 'Great condition',
			updated_at: '2024-01-01',
			images: [],
			created_at: '2024-01-02',
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
			expect(result.current.filteredAndSortedSneakers[0].brand).toBe(
				'Nike'
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
			});
			expect(result.current.filteredAndSortedSneakers).toHaveLength(
				mockSneakers.length
			);
		});
	});

	describe('Integration with domain layer', () => {
		it('should call domain methods when updating derived data', async () => {
			const { sneakerFilteringProvider } = await import(
				'@/domain/SneakerFiltering'
			);
			const { result } = renderHook(() => useSneakerFilterStore());

			act(() => {
				result.current.setSneakers(mockSneakers);
			});

			expect(sneakerFilteringProvider.filterSneakers).toHaveBeenCalled();
			expect(sneakerFilteringProvider.sortSneakers).toHaveBeenCalled();
			expect(
				sneakerFilteringProvider.getUniqueValues
			).toHaveBeenCalledWith(mockSneakers, 'EU');
		});
	});
});
