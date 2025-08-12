import { describe, expect, it, vi } from 'vitest';

import { SneakerHandler } from '@/domain/SneakerHandler';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

describe('SneakerHandler', () => {
	describe('getSneakersByUser', () => {
		it('should return sneakers for a user', async () => {
			const mockSneakers: Sneaker[] = [
				{
					id: '1',
					model: 'Air Max 90',
					brand: SneakerBrand.Nike,
					size_eu: 42,
					size_us: 8.5,
					condition: 9,
					status: SneakerStatus.Stocking,
					price_paid: 150,
					estimated_value: 200,
					user_id: 'user-1',
					created_at: '2023-01-01',
					updated_at: '2023-01-01',
					images: [],
					description: '',
					sku: '',
					gender: 'men',
					og_box: true,
					ds: false,
				},
			];

			const mockGetSneakersFunction = vi
				.fn()
				.mockResolvedValue(mockSneakers);

			const result = await SneakerHandler.getSneakersByUser(
				'user-1',
				mockGetSneakersFunction
			);

			expect(result).toEqual(mockSneakers);
			expect(mockGetSneakersFunction).toHaveBeenCalledWith('user-1');
		});

		it('should handle errors gracefully', async () => {
			const mockError = new Error('Failed to get sneakers');
			const mockGetSneakersFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerHandler.getSneakersByUser(
					'user-1',
					mockGetSneakersFunction
				)
			).rejects.toThrow('Failed to get sneakers');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.getSneakersByUser: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('createSneaker', () => {
		it('should create a sneaker successfully', async () => {
			const mockSneakerData = {
				model: 'Air Jordan 1',
				brand: SneakerBrand.Jordan,
				condition: 8,
				status: SneakerStatus.Stocking,
				price_paid: 200,
				estimated_value: 250,
				size: 42,
				description: 'Great condition',
				sku: 'AJ1-001',
				gender: 'men' as const,
				og_box: true,
				ds: false,
				images: [],
			};

			const mockCreatedSneaker: Sneaker = {
				id: '1',
				...mockSneakerData,
				size_eu: 42,
				size_us: 8.5,
				user_id: 'user-1',
				created_at: '2023-01-01',
				updated_at: '2023-01-01',
			};

			const mockCreateSneakerFunction = vi
				.fn()
				.mockResolvedValue(mockCreatedSneaker);

			const result = await SneakerHandler.createSneaker(
				mockSneakerData,
				'EU',
				mockCreateSneakerFunction
			);

			expect(result).toEqual(mockCreatedSneaker);
			expect(mockCreateSneakerFunction).toHaveBeenCalledWith(
				mockSneakerData,
				'EU'
			);
		});

		it('should handle create errors gracefully', async () => {
			const mockError = new Error('Failed to create sneaker');
			const mockCreateSneakerFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerHandler.createSneaker(
					{} as any,
					'EU',
					mockCreateSneakerFunction
				)
			).rejects.toThrow('Failed to create sneaker');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.createSneaker: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('updateSneaker', () => {
		it('should update a sneaker successfully', async () => {
			const mockUpdates = {
				model: 'Updated Model',
				condition: 7,
			};

			const mockUpdatedSneaker: Sneaker = {
				id: '1',
				model: 'Updated Model',
				brand: SneakerBrand.Nike,
				size_eu: 42,
				size_us: 8.5,
				condition: 7,
				status: SneakerStatus.Stocking,
				price_paid: 150,
				estimated_value: 200,
				user_id: 'user-1',
				created_at: '2023-01-01',
				updated_at: '2023-01-02',
				images: [],
				description: '',
				sku: '',
				gender: 'men',
				og_box: true,
				ds: false,
			};

			const mockUpdateSneakerFunction = vi
				.fn()
				.mockResolvedValue(mockUpdatedSneaker);

			const result = await SneakerHandler.updateSneaker(
				'1',
				mockUpdates,
				'EU',
				mockUpdateSneakerFunction
			);

			expect(result).toEqual(mockUpdatedSneaker);
			expect(mockUpdateSneakerFunction).toHaveBeenCalledWith(
				'1',
				mockUpdates,
				'EU'
			);
		});

		it('should handle update errors gracefully', async () => {
			const mockError = new Error('Failed to update sneaker');
			const mockUpdateSneakerFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerHandler.updateSneaker(
					'1',
					{},
					'EU',
					mockUpdateSneakerFunction
				)
			).rejects.toThrow('Failed to update sneaker');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.updateSneaker: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('deleteSneaker', () => {
		it('should delete a sneaker successfully', async () => {
			const mockDeleteSneakerFunction = vi
				.fn()
				.mockResolvedValue(undefined);

			await SneakerHandler.deleteSneaker('1', mockDeleteSneakerFunction);

			expect(mockDeleteSneakerFunction).toHaveBeenCalledWith('1');
		});

		it('should handle delete errors gracefully', async () => {
			const mockError = new Error('Failed to delete sneaker');
			const mockDeleteSneakerFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				SneakerHandler.deleteSneaker('1', mockDeleteSneakerFunction)
			).rejects.toThrow('Failed to delete sneaker');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ SneakerInterface.deleteSneaker: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});
});
