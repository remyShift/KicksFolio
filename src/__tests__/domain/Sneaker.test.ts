import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	SneakerInterface,
	SneakerProviderInterface,
} from '@/domain/SneakerProviderInterface';
import { SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { SizeUnit } from '@/types/sneaker';
import { Sneaker } from '@/types/sneaker';

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('SneakerInterface', () => {
	beforeEach(() => {
		consoleErrorSpy.mockClear();
	});

	const mockSneakerData = {
		brand: SneakerBrand.Nike,
		model: 'Air Max 90',
		status: SneakerStatus.Stocking,
		size: 42,
		condition: 9,
		images: [],
		price_paid: 150,
		description: 'Great sneaker',
		estimated_value: 200,
		gender: 'men' as 'men' | 'women',
		sku: 'DH4071-101',
		og_box: true,
		ds: false,
	};

	const mockSneaker: Sneaker = {
		id: '123',
		brand: SneakerBrand.Nike,
		model: 'Air Max 90',
		size_eu: 42,
		size_us: 8.5,
		condition: 9,
		estimated_value: 200,
		description: 'Great sneaker',
		status: SneakerStatus.Stocking,
		images: [{ id: '1', uri: 'test-uri' }],
		user_id: 'user-123',
		price_paid: 150,
		og_box: true,
		ds: false,
		gender: 'men',
		sku: 'DH4071-101',
	};

	const mockSkuSearchResponse = {
		results: [
			{
				title: 'Air Max 90',
				brand: 'Nike',
				description: 'Classic sneaker',
				gender: 'men',
				gallery: ['image1.jpg'],
				avg_price: 150,
				sku: 'DH4071-101',
			},
		],
	};

	describe('getSneakersByUser', () => {
		it('should successfully get sneakers by user and return response', async () => {
			const mockGetSneakersFunction: SneakerProviderInterface['getSneakersByUser'] =
				vi.fn().mockResolvedValue([mockSneaker]);

			const result = await SneakerInterface.getSneakersByUser(
				'user-123',
				mockGetSneakersFunction
			);

			expect(mockGetSneakersFunction).toHaveBeenCalledWith('user-123');
			expect(result).toEqual([mockSneaker]);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Database error');
			const mockGetSneakersFunction: SneakerProviderInterface['getSneakersByUser'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				SneakerInterface.getSneakersByUser(
					'user-123',
					mockGetSneakersFunction
				)
			).rejects.toThrow('Database error');

			expect(mockGetSneakersFunction).toHaveBeenCalledWith('user-123');
		});
	});

	describe('createSneaker', () => {
		it('should successfully create a sneaker and return response', async () => {
			const mockCreateSneakerFunction: SneakerProviderInterface['createSneaker'] =
				vi.fn().mockResolvedValue(mockSneaker);

			const result = await SneakerInterface.createSneaker(
				mockSneakerData,
				'EU' as SizeUnit,
				mockCreateSneakerFunction
			);

			expect(mockCreateSneakerFunction).toHaveBeenCalledWith(
				mockSneakerData,
				'EU'
			);
			expect(result).toEqual(mockSneaker);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Creation failed');
			const mockCreateSneakerFunction: SneakerProviderInterface['createSneaker'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				SneakerInterface.createSneaker(
					mockSneakerData,
					'EU' as SizeUnit,
					mockCreateSneakerFunction
				)
			).rejects.toThrow('Creation failed');

			expect(mockCreateSneakerFunction).toHaveBeenCalledWith(
				mockSneakerData,
				'EU'
			);
		});

		it('should handle validation errors', async () => {
			const validationError = new Error('Invalid sneaker data');
			const mockCreateSneakerFunction: SneakerProviderInterface['createSneaker'] =
				vi
					.fn()
					.mockImplementation(() => Promise.reject(validationError));

			await expect(
				SneakerInterface.createSneaker(
					mockSneakerData,
					'US' as SizeUnit,
					mockCreateSneakerFunction
				)
			).rejects.toThrow('Invalid sneaker data');
		});
	});

	describe('updateSneaker', () => {
		it('should successfully update a sneaker and return response', async () => {
			const updates = {
				model: 'Air Max 95',
				condition: 8,
			};
			const mockUpdateSneakerFunction: SneakerProviderInterface['updateSneaker'] =
				vi.fn().mockResolvedValue(mockSneaker);

			const result = await SneakerInterface.updateSneaker(
				'123',
				updates,
				'EU' as SizeUnit,
				mockUpdateSneakerFunction
			);

			expect(mockUpdateSneakerFunction).toHaveBeenCalledWith(
				'123',
				updates,
				'EU'
			);
			expect(result).toEqual(mockSneaker);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Update failed');
			const updates = { model: 'Air Max 95' };
			const mockUpdateSneakerFunction: SneakerProviderInterface['updateSneaker'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				SneakerInterface.updateSneaker(
					'123',
					updates,
					'US' as SizeUnit,
					mockUpdateSneakerFunction
				)
			).rejects.toThrow('Update failed');

			expect(mockUpdateSneakerFunction).toHaveBeenCalledWith(
				'123',
				updates,
				'US'
			);
		});
	});

	describe('deleteSneaker', () => {
		it('should successfully delete a sneaker', async () => {
			const mockDeleteSneakerFunction: SneakerProviderInterface['deleteSneaker'] =
				vi.fn().mockResolvedValue(undefined);

			await SneakerInterface.deleteSneaker(
				'123',
				mockDeleteSneakerFunction
			);

			expect(mockDeleteSneakerFunction).toHaveBeenCalledWith('123');
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Deletion failed');
			const mockDeleteSneakerFunction: SneakerProviderInterface['deleteSneaker'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				SneakerInterface.deleteSneaker('123', mockDeleteSneakerFunction)
			).rejects.toThrow('Deletion failed');

			expect(mockDeleteSneakerFunction).toHaveBeenCalledWith('123');
		});
	});

	describe('searchBySku', () => {
		it('should successfully search by SKU and return response', async () => {
			const mockSearchBySkuFunction: SneakerProviderInterface['searchBySku'] =
				vi.fn().mockResolvedValue(mockSkuSearchResponse);

			const result = await SneakerInterface.searchBySku(
				'DH4071-101',
				mockSearchBySkuFunction
			);

			expect(mockSearchBySkuFunction).toHaveBeenCalledWith('DH4071-101');
			expect(result).toEqual(mockSkuSearchResponse);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('SKU search failed');
			const mockSearchBySkuFunction: SneakerProviderInterface['searchBySku'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				SneakerInterface.searchBySku(
					'INVALID-SKU',
					mockSearchBySkuFunction
				)
			).rejects.toThrow('SKU search failed');

			expect(mockSearchBySkuFunction).toHaveBeenCalledWith('INVALID-SKU');
		});

		it('should handle API errors', async () => {
			const apiError = new Error('External API unavailable');
			const mockSearchBySkuFunction: SneakerProviderInterface['searchBySku'] =
				vi.fn().mockImplementation(() => Promise.reject(apiError));

			await expect(
				SneakerInterface.searchBySku(
					'DH4071-101',
					mockSearchBySkuFunction
				)
			).rejects.toThrow('External API unavailable');
		});
	});

	describe('searchByBarcode', () => {
		it('should successfully search by barcode and return response', async () => {
			const mockSearchByBarcodeFunction: SneakerProviderInterface['searchByBarcode'] =
				vi.fn().mockResolvedValue(mockSkuSearchResponse);

			const result = await SneakerInterface.searchByBarcode(
				'123456789',
				mockSearchByBarcodeFunction
			);

			expect(mockSearchByBarcodeFunction).toHaveBeenCalledWith(
				'123456789'
			);
			expect(result).toEqual(mockSkuSearchResponse);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Barcode search failed');
			const mockSearchByBarcodeFunction: SneakerProviderInterface['searchByBarcode'] =
				vi.fn().mockImplementation(() => Promise.reject(mockError));

			await expect(
				SneakerInterface.searchByBarcode(
					'INVALID-BARCODE',
					mockSearchByBarcodeFunction
				)
			).rejects.toThrow('Barcode search failed');

			expect(mockSearchByBarcodeFunction).toHaveBeenCalledWith(
				'INVALID-BARCODE'
			);
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network timeout');
			const mockSearchByBarcodeFunction: SneakerProviderInterface['searchByBarcode'] =
				vi.fn().mockImplementation(() => Promise.reject(networkError));

			await expect(
				SneakerInterface.searchByBarcode(
					'123456789',
					mockSearchByBarcodeFunction
				)
			).rejects.toThrow('Network timeout');
		});
	});
});
