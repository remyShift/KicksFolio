import { describe, it, expect, beforeEach } from 'vitest';
import { SneakerFiltering } from '@/domain/SneakerFiltering';
import { Sneaker } from '@/types/Sneaker';
import { SortOption, SortOrder, FilterState } from '@/types/filter';

describe('SneakerFiltering', () => {
	let provider: SneakerFiltering;

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
		{
			id: '3',
			model: 'Chuck Taylor',
			brand: 'Converse',
			size: 42,
			condition: 7,
			purchase_price: 60,
			images: [],
			created_at: '2024-01-03',
			user_id: 'user1',
		},
	];

	beforeEach(() => {
		provider = new SneakerFiltering();
	});

	describe('filterAndSortSneakers', () => {
		it('should return all sneakers when no filters applied', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'name',
				'asc'
			);

			expect(result).toHaveLength(3);
		});

		it('should filter by brand', () => {
			const filters: FilterState = {
				brands: ['Nike'],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'name',
				'asc'
			);

			expect(result).toHaveLength(1);
			expect(result[0].brand).toBe('Nike');
		});

		it('should filter by size', () => {
			const filters: FilterState = {
				brands: [],
				sizes: ['42'],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'name',
				'asc'
			);

			expect(result).toHaveLength(2);
			expect(result.every((s) => s.size === 42)).toBe(true);
		});

		it('should filter by condition', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: ['8'],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'name',
				'asc'
			);

			expect(result).toHaveLength(1);
			expect(result[0].condition).toBe(8);
		});

		it('should apply multiple filters', () => {
			const filters: FilterState = {
				brands: ['Nike'],
				sizes: ['42'],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'name',
				'asc'
			);

			expect(result).toHaveLength(1);
			expect(result[0].brand).toBe('Nike');
			expect(result[0].size).toBe(42);
		});

		it('should sort by name ascending', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'name',
				'asc'
			);

			expect(result[0].model).toBe('Air Force 1');
			expect(result[1].model).toBe('Chuck Taylor');
			expect(result[2].model).toBe('Stan Smith');
		});

		it('should sort by name descending', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'name',
				'desc'
			);

			expect(result[0].model).toBe('Stan Smith');
			expect(result[1].model).toBe('Chuck Taylor');
			expect(result[2].model).toBe('Air Force 1');
		});

		it('should sort by brand ascending', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'brand',
				'asc'
			);

			expect(result[0].brand).toBe('Adidas');
			expect(result[1].brand).toBe('Converse');
			expect(result[2].brand).toBe('Nike');
		});

		it('should sort by size ascending', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'size',
				'asc'
			);

			expect(result[0].size).toBe(42);
			expect(result[2].size).toBe(43);
		});

		it('should sort by condition descending', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'condition',
				'desc'
			);

			expect(result[0].condition).toBe(9);
			expect(result[1].condition).toBe(8);
			expect(result[2].condition).toBe(7);
		});

		it('should sort by value ascending', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
			};
			const result = provider.filterAndSortSneakers(
				mockSneakers,
				filters,
				'value',
				'asc'
			);

			expect(result[0].purchase_price).toBe(60);
			expect(result[1].purchase_price).toBe(80);
			expect(result[2].purchase_price).toBe(100);
		});
	});

	describe('getUniqueValues', () => {
		it('should return empty values for empty array', () => {
			const result = provider.getUniqueValues([]);

			expect(result).toEqual({
				brands: [],
				sizes: [],
				conditions: [],
			});
		});

		it('should return unique values', () => {
			const result = provider.getUniqueValues(mockSneakers);

			expect(result.brands).toEqual(
				expect.arrayContaining(['Nike', 'Adidas', 'Converse'])
			);
			expect(result.sizes).toEqual(['42', '43']);
			expect(result.conditions).toEqual(['9', '8', '7']);
		});

		it('should sort sizes ascending and conditions descending', () => {
			const result = provider.getUniqueValues(mockSneakers);

			expect(result.sizes).toEqual(['42', '43']);
			expect(result.conditions).toEqual(['9', '8', '7']);
		});

		it('should handle sneakers with undefined values', () => {
			const sneakersWithUndefined: Sneaker[] = [
				{
					id: '1',
					model: 'Test',
					brand: 'Test',
					size: undefined as any,
					condition: undefined as any,
					purchase_price: 100,
					images: [],
					created_at: '2024-01-01',
					user_id: 'user1',
				},
			];

			const result = provider.getUniqueValues(sneakersWithUndefined);

			expect(result.sizes).toEqual([]);
			expect(result.conditions).toEqual([]);
		});
	});
});
