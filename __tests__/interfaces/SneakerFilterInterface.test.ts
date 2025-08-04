import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SneakerFilterInterface } from '@/interfaces/SneakerFilterInterface';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { Filter, SortOption } from '@/types/filter';

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

const mockProvider = {
	filterSneakers: vi.fn(),
	sortSneakers: vi.fn(),
	getUniqueValues: vi.fn(),
	getSizeForUnit: vi.fn(),
};

describe('SneakerFilterInterface', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('filterSneakers', () => {
		it('should filter sneakers successfully', async () => {
			const filters: Filter = { brand: 'nike' as SneakerBrand };
			const expectedResult = [mockSneakers[0]];
			mockProvider.filterSneakers.mockReturnValue(expectedResult);

			const result = await SneakerFilterInterface.filterSneakers(
				mockSneakers,
				filters,
				'EU',
				mockProvider.filterSneakers
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.filterSneakers).toHaveBeenCalledWith(
				mockSneakers,
				filters,
				'EU'
			);
		});

		it('should handle filter error gracefully', async () => {
			const filters: Filter = { brand: 'nike' as SneakerBrand };
			mockProvider.filterSneakers.mockImplementation(() => {
				throw new Error('Filter error');
			});

			const result = await SneakerFilterInterface.filterSneakers(
				mockSneakers,
				filters,
				'EU',
				mockProvider.filterSneakers
			);

			expect(result).toBe(mockSneakers);
		});
	});

	describe('sortSneakers', () => {
		it('should sort sneakers successfully', async () => {
			const sortBy: SortOption = 'name';
			const sortOrder = 'asc';
			const expectedResult = [...mockSneakers].reverse();
			mockProvider.sortSneakers.mockReturnValue(expectedResult);

			const result = await SneakerFilterInterface.sortSneakers(
				mockSneakers,
				sortBy,
				sortOrder,
				'EU',
				mockProvider.sortSneakers
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.sortSneakers).toHaveBeenCalledWith(
				mockSneakers,
				sortBy,
				sortOrder,
				'EU'
			);
		});

		it('should handle sort error gracefully', async () => {
			const sortBy: SortOption = 'name';
			const sortOrder = 'asc';
			mockProvider.sortSneakers.mockImplementation(() => {
				throw new Error('Sort error');
			});

			const result = await SneakerFilterInterface.sortSneakers(
				mockSneakers,
				sortBy,
				sortOrder,
				'EU',
				mockProvider.sortSneakers
			);

			expect(result).toBe(mockSneakers);
		});
	});

	describe('getUniqueValues', () => {
		it('should get unique values successfully', async () => {
			const expectedResult = {
				brands: ['nike', 'adidas'],
				sizes: [42, 43],
				conditions: [8, 9],
				statuses: ['owned', 'wishlist'],
			};
			mockProvider.getUniqueValues.mockReturnValue(expectedResult);

			const result = await SneakerFilterInterface.getUniqueValues(
				mockSneakers,
				'EU',
				mockProvider.getUniqueValues
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.getUniqueValues).toHaveBeenCalledWith(
				mockSneakers,
				'EU'
			);
		});

		it('should handle get unique values error gracefully', async () => {
			mockProvider.getUniqueValues.mockImplementation(() => {
				throw new Error('Get unique values error');
			});

			const result = await SneakerFilterInterface.getUniqueValues(
				mockSneakers,
				'EU',
				mockProvider.getUniqueValues
			);

			expect(result).toEqual({
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			});
		});
	});

	describe('getSizeForUnit', () => {
		it('should get size for unit successfully', async () => {
			const expectedResult = 42;
			mockProvider.getSizeForUnit.mockReturnValue(expectedResult);

			const result = await SneakerFilterInterface.getSizeForUnit(
				mockSneakers[0],
				'EU',
				mockProvider.getSizeForUnit
			);

			expect(result).toBe(expectedResult);
			expect(mockProvider.getSizeForUnit).toHaveBeenCalledWith(
				mockSneakers[0],
				'EU'
			);
		});

		it('should handle get size error gracefully', async () => {
			mockProvider.getSizeForUnit.mockImplementation(() => {
				throw new Error('Get size error');
			});

			const result = await SneakerFilterInterface.getSizeForUnit(
				mockSneakers[0],
				'EU',
				mockProvider.getSizeForUnit
			);

			expect(result).toBe(0);
		});
	});
});
