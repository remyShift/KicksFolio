import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	SneakerFilterInterface,
	SneakerFilterProviderInterface,
} from '@/interfaces/SneakerFilterInterface';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { FilterState, SortOption, SortOrder } from '@/types/filter';

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
];

const mockFilterState: FilterState = {
	brands: ['jordan'],
	sizes: ['42'],
	conditions: ['9'],
	statuses: ['Stocking'],
};

describe('SneakerFilterInterface', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	describe('filterSneakers', () => {
		it('should successfully filter sneakers and return result', () => {
			const mockFilterSneakersFunction: SneakerFilterProviderInterface['filterSneakers'] =
				vi.fn().mockReturnValue(mockSneakers);

			const result = SneakerFilterInterface.filterSneakers(
				mockSneakers,
				mockFilterState,
				'EU',
				mockFilterSneakersFunction
			);

			expect(result).toEqual(mockSneakers);
			expect(mockFilterSneakersFunction).toHaveBeenCalledWith(
				mockSneakers,
				mockFilterState,
				'EU'
			);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them with proper logging', () => {
			const mockError = new Error('Filter error');
			const mockFilterSneakersFunction: SneakerFilterProviderInterface['filterSneakers'] =
				vi.fn().mockImplementation(() => {
					throw mockError;
				});

			expect(() =>
				SneakerFilterInterface.filterSneakers(
					mockSneakers,
					mockFilterState,
					'EU',
					mockFilterSneakersFunction
				)
			).toThrow('Filter error');

			expect(mockFilterSneakersFunction).toHaveBeenCalledWith(
				mockSneakers,
				mockFilterState,
				'EU'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerFilterInterface.filterSneakers: Error occurred:',
				mockError
			);
		});

		it('should handle US unit correctly', () => {
			const mockFilterSneakersFunction: SneakerFilterProviderInterface['filterSneakers'] =
				vi.fn().mockReturnValue(mockSneakers);

			SneakerFilterInterface.filterSneakers(
				mockSneakers,
				mockFilterState,
				'US',
				mockFilterSneakersFunction
			);

			expect(mockFilterSneakersFunction).toHaveBeenCalledWith(
				mockSneakers,
				mockFilterState,
				'US'
			);
		});
	});

	describe('sortSneakers', () => {
		it('should successfully sort sneakers and return result', () => {
			const mockSortSneakersFunction: SneakerFilterProviderInterface['sortSneakers'] =
				vi.fn().mockReturnValue(mockSneakers);

			const result = SneakerFilterInterface.sortSneakers(
				mockSneakers,
				'name',
				'asc',
				'EU',
				mockSortSneakersFunction
			);

			expect(result).toEqual(mockSneakers);
			expect(mockSortSneakersFunction).toHaveBeenCalledWith(
				mockSneakers,
				'name',
				'asc',
				'EU'
			);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them with proper logging', () => {
			const mockError = new Error('Sort error');
			const mockSortSneakersFunction: SneakerFilterProviderInterface['sortSneakers'] =
				vi.fn().mockImplementation(() => {
					throw mockError;
				});

			expect(() =>
				SneakerFilterInterface.sortSneakers(
					mockSneakers,
					'brand',
					'desc',
					'EU',
					mockSortSneakersFunction
				)
			).toThrow('Sort error');

			expect(mockSortSneakersFunction).toHaveBeenCalledWith(
				mockSneakers,
				'brand',
				'desc',
				'EU'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerFilterInterface.sortSneakers: Error occurred:',
				mockError
			);
		});

		it('should handle different sort options', () => {
			const mockSortSneakersFunction: SneakerFilterProviderInterface['sortSneakers'] =
				vi.fn().mockReturnValue(mockSneakers);

			const sortOptions: SortOption[] = [
				'name',
				'brand',
				'size',
				'condition',
				'value',
			];
			const sortOrders: SortOrder[] = ['asc', 'desc'];

			sortOptions.forEach((sortBy) => {
				sortOrders.forEach((sortOrder) => {
					SneakerFilterInterface.sortSneakers(
						mockSneakers,
						sortBy,
						sortOrder,
						'EU',
						mockSortSneakersFunction
					);
				});
			});

			expect(mockSortSneakersFunction).toHaveBeenCalledTimes(10); // 5 options * 2 orders
		});
	});

	describe('getUniqueValues', () => {
		it('should successfully get unique values and return result', () => {
			const mockUniqueValues = {
				brands: ['jordan', 'nike'],
				sizes: ['42', '43'],
				conditions: ['8', '9'],
				statuses: ['Stocking', 'Rocking'],
			};

			const mockGetUniqueValuesFunction: SneakerFilterProviderInterface['getUniqueValues'] =
				vi.fn().mockReturnValue(mockUniqueValues);

			const result = SneakerFilterInterface.getUniqueValues(
				mockSneakers,
				'EU',
				mockGetUniqueValuesFunction
			);

			expect(result).toEqual(mockUniqueValues);
			expect(mockGetUniqueValuesFunction).toHaveBeenCalledWith(
				mockSneakers,
				'EU'
			);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them with proper logging', () => {
			const mockError = new Error('Unique values error');
			const mockGetUniqueValuesFunction: SneakerFilterProviderInterface['getUniqueValues'] =
				vi.fn().mockImplementation(() => {
					throw mockError;
				});

			expect(() =>
				SneakerFilterInterface.getUniqueValues(
					mockSneakers,
					'EU',
					mockGetUniqueValuesFunction
				)
			).toThrow('Unique values error');

			expect(mockGetUniqueValuesFunction).toHaveBeenCalledWith(
				mockSneakers,
				'EU'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerFilterInterface.getUniqueValues: Error occurred:',
				mockError
			);
		});

		it('should handle US unit correctly', () => {
			const mockUniqueValues = {
				brands: ['jordan'],
				sizes: ['8.5'],
				conditions: ['9'],
				statuses: ['Stocking'],
			};

			const mockGetUniqueValuesFunction: SneakerFilterProviderInterface['getUniqueValues'] =
				vi.fn().mockReturnValue(mockUniqueValues);

			SneakerFilterInterface.getUniqueValues(
				mockSneakers,
				'US',
				mockGetUniqueValuesFunction
			);

			expect(mockGetUniqueValuesFunction).toHaveBeenCalledWith(
				mockSneakers,
				'US'
			);
		});
	});
});
