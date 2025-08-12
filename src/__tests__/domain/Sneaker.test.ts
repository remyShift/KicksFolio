import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	SneakerHandler,
	SneakerHandlerInterface,
} from '@/domain/SneakerHandler';
import { SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { SizeUnit } from '@/types/sneaker';
import { Sneaker } from '@/types/sneaker';

describe('SneakerHandler', () => {
	let mockSneakerProvider: SneakerHandlerInterface;
	let sneakerHandler: SneakerHandler;
	let consoleErrorSpy: any;

	beforeEach(() => {
		consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		// Create mock provider
		mockSneakerProvider = {
			getSneakersByUser: vi.fn(),
			createSneaker: vi.fn(),
			updateSneaker: vi.fn(),
			deleteSneaker: vi.fn(),
			searchBySku: vi.fn(),
			searchByBarcode: vi.fn(),
		};

		// Create sneaker handler instance with mock provider
		sneakerHandler = new SneakerHandler(mockSneakerProvider);
	});

	afterEach(() => {
		vi.restoreAllMocks();
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
			(mockSneakerProvider.getSneakersByUser as any).mockResolvedValue([
				mockSneaker,
			]);

			const result = await sneakerHandler.getSneakersByUser('user-123');

			expect(mockSneakerProvider.getSneakersByUser).toHaveBeenCalledWith(
				'user-123'
			);
			expect(result).toEqual([mockSneaker]);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Database error');
			(mockSneakerProvider.getSneakersByUser as any).mockRejectedValue(
				mockError
			);

			await expect(
				sneakerHandler.getSneakersByUser('user-123')
			).rejects.toThrow('Database error');

			expect(mockSneakerProvider.getSneakersByUser).toHaveBeenCalledWith(
				'user-123'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.getSneakersByUser: Error occurred:',
				mockError
			);
		});
	});

	describe('createSneaker', () => {
		it('should successfully create a sneaker and return response', async () => {
			(mockSneakerProvider.createSneaker as any).mockResolvedValue(
				mockSneaker
			);

			const result = await sneakerHandler.createSneaker(
				mockSneakerData,
				'EU' as SizeUnit
			);

			expect(mockSneakerProvider.createSneaker).toHaveBeenCalledWith(
				mockSneakerData,
				'EU'
			);
			expect(result).toEqual(mockSneaker);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Creation failed');
			(mockSneakerProvider.createSneaker as any).mockRejectedValue(
				mockError
			);

			await expect(
				sneakerHandler.createSneaker(mockSneakerData, 'EU' as SizeUnit)
			).rejects.toThrow('Creation failed');

			expect(mockSneakerProvider.createSneaker).toHaveBeenCalledWith(
				mockSneakerData,
				'EU'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.createSneaker: Error occurred:',
				mockError
			);
		});

		it('should handle validation errors', async () => {
			const validationError = new Error('Invalid sneaker data');
			(mockSneakerProvider.createSneaker as any).mockRejectedValue(
				validationError
			);

			await expect(
				sneakerHandler.createSneaker(mockSneakerData, 'US' as SizeUnit)
			).rejects.toThrow('Invalid sneaker data');
		});
	});

	describe('updateSneaker', () => {
		it('should successfully update a sneaker and return response', async () => {
			const updates = {
				model: 'Air Max 95',
				condition: 8,
			};
			(mockSneakerProvider.updateSneaker as any).mockResolvedValue(
				mockSneaker
			);

			const result = await sneakerHandler.updateSneaker(
				'123',
				updates,
				'EU' as SizeUnit
			);

			expect(mockSneakerProvider.updateSneaker).toHaveBeenCalledWith(
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
			(mockSneakerProvider.updateSneaker as any).mockRejectedValue(
				mockError
			);

			await expect(
				sneakerHandler.updateSneaker('123', updates, 'US' as SizeUnit)
			).rejects.toThrow('Update failed');

			expect(mockSneakerProvider.updateSneaker).toHaveBeenCalledWith(
				'123',
				updates,
				'US'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.updateSneaker: Error occurred:',
				mockError
			);
		});
	});

	describe('deleteSneaker', () => {
		it('should successfully delete a sneaker', async () => {
			(mockSneakerProvider.deleteSneaker as any).mockResolvedValue(
				undefined
			);

			await sneakerHandler.deleteSneaker('123');

			expect(mockSneakerProvider.deleteSneaker).toHaveBeenCalledWith(
				'123'
			);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Deletion failed');
			(mockSneakerProvider.deleteSneaker as any).mockRejectedValue(
				mockError
			);

			await expect(sneakerHandler.deleteSneaker('123')).rejects.toThrow(
				'Deletion failed'
			);

			expect(mockSneakerProvider.deleteSneaker).toHaveBeenCalledWith(
				'123'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.deleteSneaker: Error occurred:',
				mockError
			);
		});
	});

	describe('searchBySku', () => {
		it('should successfully search by SKU and return response', async () => {
			(mockSneakerProvider.searchBySku as any).mockResolvedValue(
				mockSkuSearchResponse
			);

			const result = await sneakerHandler.searchBySku('DH4071-101');

			expect(mockSneakerProvider.searchBySku).toHaveBeenCalledWith(
				'DH4071-101'
			);
			expect(result).toEqual(mockSkuSearchResponse);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('SKU search failed');
			(mockSneakerProvider.searchBySku as any).mockRejectedValue(
				mockError
			);

			await expect(
				sneakerHandler.searchBySku('INVALID-SKU')
			).rejects.toThrow('SKU search failed');

			expect(mockSneakerProvider.searchBySku).toHaveBeenCalledWith(
				'INVALID-SKU'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.searchBySku: Error occurred:',
				mockError
			);
		});

		it('should handle API errors', async () => {
			const apiError = new Error('External API unavailable');
			(mockSneakerProvider.searchBySku as any).mockRejectedValue(
				apiError
			);

			await expect(
				sneakerHandler.searchBySku('DH4071-101')
			).rejects.toThrow('External API unavailable');
		});
	});

	describe('searchByBarcode', () => {
		it('should successfully search by barcode and return response', async () => {
			(mockSneakerProvider.searchByBarcode as any).mockResolvedValue(
				mockSkuSearchResponse
			);

			const result = await sneakerHandler.searchByBarcode('123456789');

			expect(mockSneakerProvider.searchByBarcode).toHaveBeenCalledWith(
				'123456789'
			);
			expect(result).toEqual(mockSkuSearchResponse);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('should handle errors and rethrow them', async () => {
			const mockError = new Error('Barcode search failed');
			(mockSneakerProvider.searchByBarcode as any).mockRejectedValue(
				mockError
			);

			await expect(
				sneakerHandler.searchByBarcode('INVALID-BARCODE')
			).rejects.toThrow('Barcode search failed');

			expect(mockSneakerProvider.searchByBarcode).toHaveBeenCalledWith(
				'INVALID-BARCODE'
			);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.searchByBarcode: Error occurred:',
				mockError
			);
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network timeout');
			(mockSneakerProvider.searchByBarcode as any).mockRejectedValue(
				networkError
			);

			await expect(
				sneakerHandler.searchByBarcode('123456789')
			).rejects.toThrow('Network timeout');
		});
	});
});
