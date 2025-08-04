import { describe, it, expect, beforeEach } from 'vitest';
import { SneakerFilterProvider } from '@/domain/SneakerFilterProvider';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { Filter } from '@/types/filter';

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
	{
		id: '3',
		model: 'Chuck Taylor',
		brand: 'converse' as SneakerBrand,
		size_eu: 42,
		size_us: 8.5,
		condition: 7,
		status: 'owned' as SneakerStatus,
		estimated_value: 80,
		price_paid: 60,
		user_id: 'user1',
		created_at: '2023-01-03',
		updated_at: '2023-01-03',
		images: [],
		description: 'Chuck Taylor',
	},
];

describe('SneakerFilterProvider', () => {
	let provider: SneakerFilterProvider;

	beforeEach(() => {
		provider = new SneakerFilterProvider();
	});

	describe('getSizeForUnit', () => {
		it('should return EU size when unit is EU', () => {
			const result = provider.getSizeForUnit(mockSneakers[0], 'EU');
			expect(result).toBe(42);
		});

		it('should return US size when unit is US', () => {
			const result = provider.getSizeForUnit(mockSneakers[0], 'US');
			expect(result).toBe(8.5);
		});
	});

	describe('filterSneakers', () => {
		it('should return all sneakers when no filters', () => {
			const result = provider.filterSneakers(mockSneakers, {}, 'EU');
			expect(result).toHaveLength(3);
		});

		it('should filter by brand', () => {
			const filters: Filter = { brand: 'nike' as SneakerBrand };
			const result = provider.filterSneakers(mockSneakers, filters, 'EU');
			expect(result).toHaveLength(1);
			expect(result[0].brand).toBe('nike');
		});

		it('should filter by size (EU)', () => {
			const filters: Filter = { size: 42 };
			const result = provider.filterSneakers(mockSneakers, filters, 'EU');
			expect(result).toHaveLength(2);
			expect(result.every((s) => s.size_eu === 42)).toBe(true);
		});

		it('should filter by size (US)', () => {
			const filters: Filter = { size: 9 };
			const result = provider.filterSneakers(mockSneakers, filters, 'US');
			expect(result).toHaveLength(1);
			expect(result[0].size_us).toBe(9);
		});

		it('should filter by condition', () => {
			const filters: Filter = { condition: 8 };
			const result = provider.filterSneakers(mockSneakers, filters, 'EU');
			expect(result).toHaveLength(1);
			expect(result[0].condition).toBe(8);
		});

		it('should filter by status', () => {
			const filters: Filter = { status: 'owned' as SneakerStatus };
			const result = provider.filterSneakers(mockSneakers, filters, 'EU');
			expect(result).toHaveLength(2);
			expect(
				result.every((s) => s.status === ('owned' as SneakerStatus))
			).toBe(true);
		});

		it('should apply multiple filters', () => {
			const filters: Filter = {
				brand: 'nike' as SneakerBrand,
				status: 'owned' as SneakerStatus,
			};
			const result = provider.filterSneakers(mockSneakers, filters, 'EU');
			expect(result).toHaveLength(1);
			expect(result[0].brand).toBe('nike');
			expect(result[0].status).toBe('owned');
		});
	});

	describe('sortSneakers', () => {
		it('should sort by name ascending', () => {
			const result = provider.sortSneakers(
				mockSneakers,
				'name',
				'asc',
				'EU'
			);
			expect(result[0].model).toBe('Air Max 90');
			expect(result[1].model).toBe('Chuck Taylor');
			expect(result[2].model).toBe('Stan Smith');
		});

		it('should sort by name descending', () => {
			const result = provider.sortSneakers(
				mockSneakers,
				'name',
				'desc',
				'EU'
			);
			expect(result[0].model).toBe('Stan Smith');
			expect(result[1].model).toBe('Chuck Taylor');
			expect(result[2].model).toBe('Air Max 90');
		});

		it('should sort by brand ascending', () => {
			const result = provider.sortSneakers(
				mockSneakers,
				'brand',
				'asc',
				'EU'
			);
			expect(result[0].brand).toBe('adidas');
			expect(result[1].brand).toBe('converse');
			expect(result[2].brand).toBe('nike');
		});

		it('should sort by size (EU) ascending', () => {
			const result = provider.sortSneakers(
				mockSneakers,
				'size',
				'asc',
				'EU'
			);
			expect(result[0].size_eu).toBe(42);
			expect(result[2].size_eu).toBe(43);
		});

		it('should sort by size (US) ascending', () => {
			const result = provider.sortSneakers(
				mockSneakers,
				'size',
				'asc',
				'US'
			);
			expect(result[0].size_us).toBe(8.5);
			expect(result[2].size_us).toBe(9);
		});

		it('should sort by condition descending', () => {
			const result = provider.sortSneakers(
				mockSneakers,
				'condition',
				'desc',
				'EU'
			);
			expect(result[0].condition).toBe(9);
			expect(result[1].condition).toBe(8);
			expect(result[2].condition).toBe(7);
		});

		it('should sort by value ascending', () => {
			const result = provider.sortSneakers(
				mockSneakers,
				'value',
				'asc',
				'EU'
			);
			expect(result[0].estimated_value).toBe(80);
			expect(result[1].estimated_value).toBe(100);
			expect(result[2].estimated_value).toBe(150);
		});
	});

	describe('getUniqueValues', () => {
		it('should return empty values for empty array', () => {
			const result = provider.getUniqueValues([], 'EU');
			expect(result).toEqual({
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			});
		});

		it('should return unique values (EU)', () => {
			const result = provider.getUniqueValues(mockSneakers, 'EU');
			expect(result.brands).toEqual(
				expect.arrayContaining(['nike', 'adidas', 'converse'])
			);
			expect(result.sizes).toEqual([42, 43]);
			expect(result.conditions).toEqual([9, 8, 7]);
			expect(result.statuses).toEqual(
				expect.arrayContaining(['owned', 'wishlist'])
			);
		});

		it('should return unique values (US)', () => {
			const result = provider.getUniqueValues(mockSneakers, 'US');
			expect(result.sizes).toEqual([8.5, 9]);
		});

		it('should sort sizes ascending and conditions descending', () => {
			const result = provider.getUniqueValues(mockSneakers, 'EU');
			expect(result.sizes).toEqual([42, 43]);
			expect(result.conditions).toEqual([9, 8, 7]);
		});
	});
});
