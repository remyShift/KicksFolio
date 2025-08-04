import { renderHook, act } from '@testing-library/react';
import { useSneakerFilterStore } from '@/store/useSneakerFilterStore';
import { Sneaker } from '@/types/Sneaker';

// Mock du domain provider
vi.mock('@/domain/SneakerFiltering', () => ({
	sneakerFilterProvider: {
		filterAndSortSneakers: vi.fn((sneakers, filters, sortBy, sortOrder) => {
			// Logique simplifiée pour les tests
			let result = [...sneakers];

			// Filtrage
			if (filters.brands.length > 0) {
				result = result.filter((s) => filters.brands.includes(s.brand));
			}

			// Tri
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
		getUniqueValues: vi.fn((sneakers) => ({
			brands: [...new Set(sneakers.map((s) => s.brand))],
			sizes: [
				...new Set(
					sneakers.map((s) => s.size?.toString()).filter(Boolean)
				),
			],
			conditions: [
				...new Set(
					sneakers.map((s) => s.condition?.toString()).filter(Boolean)
				),
			],
		})),
	},
}));

describe('useSneakerFilterStore', () => {
	const mockSneakers: Sneaker[] = [
		{
			id: '1',
			model: 'Air Force 1',
			brand: 'Nike',
			size: 42,
			condition: 8,
			purchase_price: 100,
			images: [],
			created_at: '2024-01-01',
			user_id: 'user1',
		},
		{
			id: '2',
			model: 'Stan Smith',
			brand: 'Adidas',
			size: 43,
			condition: 9,
			purchase_price: 80,
			images: [],
			created_at: '2024-01-02',
			user_id: 'user1',
		},
	];

	beforeEach(() => {
		// Reset store state
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

			// Par défaut: name, asc
			expect(result.current.sortBy).toBe('name');
			expect(result.current.sortOrder).toBe('asc');

			// Premier toggle: même option -> change juste l'ordre
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
			// Vérifier que les données filtrées ont été mises à jour
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

			// Vérifier que le filtre est appliqué
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
			const { sneakerFilterProvider } = await import(
				'@/domain/SneakerFiltering'
			);
			const { result } = renderHook(() => useSneakerFilterStore());

			act(() => {
				result.current.setSneakers(mockSneakers);
			});

			expect(
				sneakerFilterProvider.filterAndSortSneakers
			).toHaveBeenCalled();
			expect(sneakerFilterProvider.getUniqueValues).toHaveBeenCalledWith(
				mockSneakers
			);
		});
	});
});
