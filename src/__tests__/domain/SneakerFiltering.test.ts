import { beforeEach, describe, expect, it } from 'vitest';

import { sneakerFilteringProvider } from '@/src/domain/SneakerFiltering';
import { FilterState } from '@/types/filter';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

describe('SneakerFiltering', () => {
	const mockSneakers: Sneaker[] = [
		{
			id: '1',
			user_id: 'user1',
			model: 'Air Jordan 1',
			brand: SneakerBrand.Jordan,
			size_eu: 42,
			size_us: 8.5,
			condition: 9,
			status: SneakerStatus.Stocking,
			price_paid: 200,
			description: 'Great condition',
			images: [],
			created_at: '2023-01-01',
			updated_at: '2023-01-01',
			estimated_value: 250,
			sku: 'AJ1-001',
			gender: 'unisex',
			og_box: true,
			ds: false,
			owner: {
				id: 'user1',
				username: 'sneakerhead',
				first_name: 'John',
				last_name: 'Doe',
			},
			wishlist_added_at: '2023-01-01',
		},
		{
			id: '2',
			user_id: 'user2',
			model: 'Air Max 90',
			brand: SneakerBrand.Nike,
			size_eu: 43,
			size_us: 9,
			condition: 8,
			status: SneakerStatus.Rocking,
			price_paid: 150,
			description: 'Good condition',
			images: [],
			created_at: '2023-01-02',
			updated_at: '2023-01-02',
			estimated_value: 180,
			sku: 'AM90-001',
			gender: 'men',
			og_box: false,
			ds: false,
			owner: {
				id: 'user2',
				username: 'runner',
				first_name: 'Jane',
				last_name: 'Smith',
			},
			wishlist_added_at: '2023-01-02',
		},
		{
			id: '3',
			user_id: 'user3',
			model: 'Stan Smith',
			brand: SneakerBrand.Adidas,
			size_eu: 41,
			size_us: 8,
			condition: 7,
			status: SneakerStatus.Selling,
			price_paid: 80,
			description: 'Used condition',
			images: [],
			created_at: '2023-01-03',
			updated_at: '2023-01-03',
			estimated_value: 90,
			sku: 'SS-001',
			gender: 'unisex',
			og_box: true,
			ds: false,
			owner: {
				id: 'user3',
				username: 'collector',
				first_name: 'Bob',
				last_name: 'Wilson',
			},
			wishlist_added_at: '2023-01-03',
		},
	];

	describe('filterSneakers', () => {
		it('should return all sneakers when no filters are applied', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'EU'
			);

			expect(result).toHaveLength(3);
			expect(result).toEqual(mockSneakers);
		});

		it('should filter sneakers by brand', () => {
			const filters: FilterState = {
				brands: ['JORDAN'],
				sizes: [],
				conditions: [],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'EU'
			);

			expect(result).toHaveLength(1);
			expect(result[0].brand).toBe(SneakerBrand.Jordan);
		});

		it('should filter sneakers by size (EU)', () => {
			const filters: FilterState = {
				brands: [],
				sizes: ['42'],
				conditions: [],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'EU'
			);

			expect(result).toHaveLength(1);
			expect(result[0].size_eu).toBe(42);
		});

		it('should filter sneakers by size (US)', () => {
			const filters: FilterState = {
				brands: [],
				sizes: ['8.5'],
				conditions: [],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'US'
			);

			expect(result).toHaveLength(1);
			expect(result[0].size_us).toBe(8.5);
		});

		it('should filter sneakers by condition', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: ['9'],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'EU'
			);

			expect(result).toHaveLength(1);
			expect(result[0].condition).toBe(9);
		});

		it('should filter sneakers by status', () => {
			const filters: FilterState = {
				brands: [],
				sizes: [],
				conditions: [],
				statuses: ['Rocking'],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'EU'
			);

			expect(result).toHaveLength(1);
			expect(result[0].status).toBe(SneakerStatus.Rocking);
		});

		it('should apply multiple filters', () => {
			const filters: FilterState = {
				brands: ['NIKE', 'JORDAN'],
				sizes: ['42', '43'],
				conditions: ['8', '9'],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'EU'
			);

			expect(result).toHaveLength(2);
			expect(
				result.every((s) => ['NIKE', 'JORDAN'].includes(s.brand))
			).toBe(true);
			expect(result.every((s) => [42, 43].includes(s.size_eu))).toBe(
				true
			);
			expect(result.every((s) => [8, 9].includes(s.condition))).toBe(
				true
			);
		});

		it('should return empty array when no sneakers match filters', () => {
			const filters: FilterState = {
				brands: ['nonexistent'],
				sizes: [],
				conditions: [],
			};

			const result = sneakerFilteringProvider.filterSneakers(
				mockSneakers,
				filters,
				'EU'
			);

			expect(result).toHaveLength(0);
		});
	});

	describe('sortSneakers', () => {
		it('should sort sneakers by name (ascending)', () => {
			const result = sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'name',
				'asc',
				'EU'
			);

			expect(result).toHaveLength(3);
			expect(result[0].model).toBe('Air Jordan 1');
			expect(result[1].model).toBe('Air Max 90');
			expect(result[2].model).toBe('Stan Smith');
		});

		it('should sort sneakers by name (descending)', () => {
			const result = sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'name',
				'desc',
				'EU'
			);

			expect(result).toHaveLength(3);
			expect(result[0].model).toBe('Stan Smith');
			expect(result[1].model).toBe('Air Max 90');
			expect(result[2].model).toBe('Air Jordan 1');
		});

		it('should sort sneakers by brand (ascending)', () => {
			const result = sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'brand',
				'asc',
				'EU'
			);

			expect(result).toHaveLength(3);
			expect(result[0].brand).toBe(SneakerBrand.Adidas);
			expect(result[1].brand).toBe(SneakerBrand.Jordan);
			expect(result[2].brand).toBe(SneakerBrand.Nike);
		});

		it('should sort sneakers by size EU (ascending)', () => {
			const result = sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'size',
				'asc',
				'EU'
			);

			expect(result).toHaveLength(3);
			expect(result[0].size_eu).toBe(41);
			expect(result[1].size_eu).toBe(42);
			expect(result[2].size_eu).toBe(43);
		});

		it('should sort sneakers by size US (ascending)', () => {
			const result = sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'size',
				'asc',
				'US'
			);

			expect(result).toHaveLength(3);
			expect(result[0].size_us).toBe(8);
			expect(result[1].size_us).toBe(8.5);
			expect(result[2].size_us).toBe(9);
		});

		it('should sort sneakers by condition (ascending)', () => {
			const result = sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'condition',
				'asc',
				'EU'
			);

			expect(result).toHaveLength(3);
			expect(result[0].condition).toBe(7);
			expect(result[1].condition).toBe(8);
			expect(result[2].condition).toBe(9);
		});

		it('should sort sneakers by value (price_paid) (ascending)', () => {
			const result = sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'value',
				'asc',
				'EU'
			);

			expect(result).toHaveLength(3);
			expect(result[0].price_paid).toBe(80);
			expect(result[1].price_paid).toBe(150);
			expect(result[2].price_paid).toBe(200);
		});

		it('should not modify original array', () => {
			const originalLength = mockSneakers.length;
			const originalFirst = mockSneakers[0].model;

			sneakerFilteringProvider.sortSneakers(
				mockSneakers,
				'name',
				'desc',
				'EU'
			);

			expect(mockSneakers).toHaveLength(originalLength);
			expect(mockSneakers[0].model).toBe(originalFirst);
		});
	});

	describe('getUniqueValues', () => {
		it('should return unique brands sorted alphabetically', () => {
			const result = sneakerFilteringProvider.getUniqueValues(
				mockSneakers,
				'EU'
			);

			expect(result.brands).toEqual(['ADIDAS', 'JORDAN', 'NIKE']);
		});

		it('should return unique sizes (EU) sorted numerically', () => {
			const result = sneakerFilteringProvider.getUniqueValues(
				mockSneakers,
				'EU'
			);

			expect(result.sizes).toEqual(['41', '42', '43']);
		});

		it('should return unique sizes (US) sorted numerically', () => {
			const result = sneakerFilteringProvider.getUniqueValues(
				mockSneakers,
				'US'
			);

			expect(result.sizes).toEqual(['8', '8.5', '9']);
		});

		it('should return unique conditions sorted by highest first', () => {
			const result = sneakerFilteringProvider.getUniqueValues(
				mockSneakers,
				'EU'
			);

			expect(result.conditions).toEqual(['9', '8', '7']);
		});

		it('should return unique statuses sorted alphabetically', () => {
			const result = sneakerFilteringProvider.getUniqueValues(
				mockSneakers,
				'EU'
			);

			expect(result.statuses).toEqual(['Rocking', 'Selling', 'Stocking']);
		});

		it('should handle empty sneakers array', () => {
			const result = sneakerFilteringProvider.getUniqueValues([], 'EU');

			expect(result.brands).toEqual([]);
			expect(result.sizes).toEqual([]);
			expect(result.conditions).toEqual([]);
			expect(result.statuses).toEqual([]);
		});

		it('should filter out null/undefined values', () => {
			const sneakersWithNulls = [
				...mockSneakers,
				{
					...mockSneakers[0],
					id: '4',
					brand: null as any,
					size_eu: null as any,
					size_us: null as any,
					condition: null as any,
					status: null as any,
				},
			];

			const result = sneakerFilteringProvider.getUniqueValues(
				sneakersWithNulls,
				'EU'
			);

			expect(result.brands).toEqual(['ADIDAS', 'JORDAN', 'NIKE']);
			expect(result.sizes).toEqual(['41', '42', '43']);
			expect(result.conditions).toEqual(['9', '8', '7']);
			expect(result.statuses).toEqual(['Rocking', 'Selling', 'Stocking']);
		});
	});
});
