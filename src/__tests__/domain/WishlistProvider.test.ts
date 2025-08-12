import { describe, expect, it, vi } from 'vitest';

import { Wishlist } from '@/domain/Wishlist';
import { WishlistItem } from '@/tech/proxy/WishlistProxy';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

describe('Wishlist', () => {
	describe('addToWishlist', () => {
		it('should add sneaker to wishlist successfully', async () => {
			const mockWishlistItem: WishlistItem = {
				id: '1',
				user_id: 'user-1',
				sneaker_id: 'sneaker-1',
				created_at: '2023-01-01T00:00:00.000Z',
			};

			const mockAddToWishlistFunction = vi
				.fn()
				.mockResolvedValue(mockWishlistItem);

			const result = await Wishlist.addToWishlist(
				'sneaker-1',
				mockAddToWishlistFunction
			);

			expect(result).toEqual(mockWishlistItem);
			expect(mockAddToWishlistFunction).toHaveBeenCalledWith('sneaker-1');
		});

		it('should handle add to wishlist errors gracefully', async () => {
			const mockError = new Error('Failed to add to wishlist');
			const mockAddToWishlistFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				Wishlist.addToWishlist('sneaker-1', mockAddToWishlistFunction)
			).rejects.toThrow('Failed to add to wishlist');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ Wishlist.addToWishlist: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('removeFromWishlist', () => {
		it('should remove sneaker from wishlist successfully', async () => {
			const mockRemoveFromWishlistFunction = vi
				.fn()
				.mockResolvedValue(undefined);

			await Wishlist.removeFromWishlist(
				'sneaker-1',
				mockRemoveFromWishlistFunction
			);

			expect(mockRemoveFromWishlistFunction).toHaveBeenCalledWith(
				'sneaker-1'
			);
		});

		it('should handle remove from wishlist errors gracefully', async () => {
			const mockError = new Error('Failed to remove from wishlist');
			const mockRemoveFromWishlistFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				Wishlist.removeFromWishlist(
					'sneaker-1',
					mockRemoveFromWishlistFunction
				)
			).rejects.toThrow('Failed to remove from wishlist');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ Wishlist.removeFromWishlist: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('isInWishlist', () => {
		it('should return true when sneaker is in wishlist', async () => {
			const mockIsInWishlistFunction = vi.fn().mockResolvedValue(true);

			const result = await Wishlist.isInWishlist(
				'sneaker-1',
				mockIsInWishlistFunction
			);

			expect(result).toBe(true);
			expect(mockIsInWishlistFunction).toHaveBeenCalledWith('sneaker-1');
		});

		it('should return false when sneaker is not in wishlist', async () => {
			const mockIsInWishlistFunction = vi.fn().mockResolvedValue(false);

			const result = await Wishlist.isInWishlist(
				'sneaker-1',
				mockIsInWishlistFunction
			);

			expect(result).toBe(false);
			expect(mockIsInWishlistFunction).toHaveBeenCalledWith('sneaker-1');
		});

		it('should handle isInWishlist errors gracefully', async () => {
			const mockError = new Error('Failed to check wishlist');
			const mockIsInWishlistFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				Wishlist.isInWishlist('sneaker-1', mockIsInWishlistFunction)
			).rejects.toThrow('Failed to check wishlist');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ Wishlist.isInWishlist: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getUserWishlistSneakers', () => {
		it('should return user wishlist sneakers', async () => {
			const mockWishlistSneakers: Sneaker[] = [
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

			const mockGetUserWishlistSneakersFunction = vi
				.fn()
				.mockResolvedValue(mockWishlistSneakers);

			const result = await Wishlist.getUserWishlistSneakers(
				'user-1',
				mockGetUserWishlistSneakersFunction
			);

			expect(result).toEqual(mockWishlistSneakers);
			expect(mockGetUserWishlistSneakersFunction).toHaveBeenCalledWith(
				'user-1'
			);
		});

		it('should handle getUserWishlistSneakers errors gracefully', async () => {
			const mockError = new Error('Failed to get user wishlist sneakers');
			const mockGetUserWishlistSneakersFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				Wishlist.getUserWishlistSneakers(
					'user-1',
					mockGetUserWishlistSneakersFunction
				)
			).rejects.toThrow('Failed to get user wishlist sneakers');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ Wishlist.getUserWishlistSneakers: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getWishlistsForSneaker', () => {
		it('should return wishlists for a sneaker', async () => {
			const mockWishlists = [
				{
					id: '1',
					user_id: 'user-1',
					sneaker_id: 'sneaker-1',
					created_at: '2023-01-01T00:00:00.000Z',
					users: {
						id: 'user-1',
						username: 'testuser',
						first_name: 'Test',
						last_name: 'User',
						profile_picture: null,
					},
				},
			];

			const mockGetWishlistsForSneakerFunction = vi
				.fn()
				.mockResolvedValue(mockWishlists);

			const result = await Wishlist.getWishlistsForSneaker(
				'sneaker-1',
				mockGetWishlistsForSneakerFunction
			);

			expect(result).toEqual(mockWishlists);
			expect(mockGetWishlistsForSneakerFunction).toHaveBeenCalledWith(
				'sneaker-1'
			);
		});

		it('should handle getWishlistsForSneaker errors gracefully', async () => {
			const mockError = new Error('Failed to get wishlists for sneaker');
			const mockGetWishlistsForSneakerFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				Wishlist.getWishlistsForSneaker(
					'sneaker-1',
					mockGetWishlistsForSneakerFunction
				)
			).rejects.toThrow('Failed to get wishlists for sneaker');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ Wishlist.getWishlistsForSneaker: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});
});
