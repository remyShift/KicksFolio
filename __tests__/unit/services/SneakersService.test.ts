import { SneakersService } from '@/services/SneakersService';
import { Sneaker } from '@/types/Sneaker';
import * as addSneakerScript from '@/scripts/handleSneakers/addSneaker';
import * as deleteSneakerScript from '@/scripts/handleSneakers/deleteSneaker';
import * as skuLookUpScript from '@/scripts/handleSneakers/skuLookUp';

jest.mock('@/scripts/handleSneakers/addSneaker');
jest.mock('@/scripts/handleSneakers/deleteSneaker');
jest.mock('@/scripts/handleSneakers/skuLookUp');

const mockAddSneaker = jest.mocked(addSneakerScript.addSneaker);
const mockDeleteSneaker = jest.mocked(deleteSneakerScript.deleteSneaker);
const mockSkuLookUp = jest.mocked(skuLookUpScript.skuLookUp);

const mockSneaker: Sneaker = {
	id: '1',
	model: 'Air Jordan 1',
	brand: 'Nike',
	size: 42,
	condition: 9,
	status: 'rocking',
	price_paid: 150,
	purchase_date: '2024-01-01',
	description: 'Great sneaker',
	estimated_value: 200,
	release_date: '2023-01-01',
	collection_id: '1',
	created_at: '2024-01-01',
	updated_at: '2024-01-01',
	images: [
		{
			id: '1',
			url: 'test-image.jpg',
		},
	],
};

describe('SneakersService', () => {
	let sneakersService: SneakersService;
	const userId = 'user-123';
	const sessionToken = 'fake-token';

	beforeEach(() => {
		sneakersService = new SneakersService(userId, sessionToken);
		global.fetch = jest.fn();
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with userId and sessionToken', () => {
			expect(sneakersService).toBeInstanceOf(SneakersService);
		});
	});

	describe('add', () => {
		it('should add sneaker successfully', async () => {
			const mockResponse = { success: true, sneaker: mockSneaker };
			mockAddSneaker.mockResolvedValueOnce(mockResponse);

			const result = await sneakersService.add(mockSneaker);

			expect(mockAddSneaker).toHaveBeenCalledWith(
				mockSneaker,
				'',
				sessionToken,
				userId
			);
			expect(result).toEqual(mockResponse);
		});

		it('should add sneaker with specific sneakerId', async () => {
			const mockResponse = { success: true, sneaker: mockSneaker };
			const sneakerId = 'sneaker-456';
			mockAddSneaker.mockResolvedValueOnce(mockResponse);

			const result = await sneakersService.add(mockSneaker, sneakerId);

			expect(mockAddSneaker).toHaveBeenCalledWith(
				mockSneaker,
				sneakerId,
				sessionToken,
				userId
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle add sneaker errors', async () => {
			const errorResponse = {
				success: false,
				error: 'Validation failed',
			};
			mockAddSneaker.mockResolvedValueOnce(errorResponse);

			const result = await sneakersService.add(mockSneaker);

			expect(result).toEqual(errorResponse);
		});

		it('should handle network errors during add', async () => {
			mockAddSneaker.mockRejectedValueOnce(new Error('Network error'));

			await expect(sneakersService.add(mockSneaker)).rejects.toThrow(
				'Network error'
			);
		});
	});

	describe('delete', () => {
		it('should delete sneaker successfully', async () => {
			const mockResponse = { success: true, message: 'Sneaker deleted' };
			(mockDeleteSneaker as jest.Mock).mockResolvedValueOnce(
				mockResponse
			);

			const result = await sneakersService.delete('sneaker-123');

			expect(mockDeleteSneaker).toHaveBeenCalledWith(
				'sneaker-123',
				userId,
				sessionToken
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle delete errors', async () => {
			const errorResponse = {
				success: false,
				error: 'Sneaker not found',
			};
			(mockDeleteSneaker as jest.Mock).mockResolvedValueOnce(
				errorResponse
			);

			const result = await sneakersService.delete('nonexistent-sneaker');

			expect(result).toEqual(errorResponse);
		});

		it('should handle network errors during delete', async () => {
			mockDeleteSneaker.mockRejectedValueOnce(new Error('Network error'));

			await expect(sneakersService.delete('sneaker-123')).rejects.toThrow(
				'Network error'
			);
		});
	});

	describe('searchBySku', () => {
		it('should search sneaker by SKU successfully', async () => {
			const mockResponse = { success: true, sneaker: mockSneaker };
			mockSkuLookUp.mockResolvedValueOnce(mockResponse);

			const result = await sneakersService.searchBySku('SKU-123');

			expect(mockSkuLookUp).toHaveBeenCalledWith('SKU-123', sessionToken);
			expect(result).toEqual(mockResponse);
		});

		it('should handle SKU not found', async () => {
			const mockResponse = { success: false, error: 'SKU not found' };
			mockSkuLookUp.mockResolvedValueOnce(mockResponse);

			const result = await sneakersService.searchBySku('INVALID-SKU');

			expect(result).toEqual(mockResponse);
		});

		it('should handle network errors during SKU search', async () => {
			mockSkuLookUp.mockRejectedValueOnce(new Error('Network error'));

			await expect(
				sneakersService.searchBySku('SKU-123')
			).rejects.toThrow('Network error');
		});
	});

	describe('getUserSneakers', () => {
		it('should fetch user sneakers successfully', async () => {
			const mockResponse = { sneakers: [mockSneaker] };
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await sneakersService.getUserSneakers();

			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/${userId}/collection/sneakers`,
				{
					headers: expect.objectContaining({
						Authorization: `Bearer ${sessionToken}`,
					}),
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle fetch errors for user sneakers', async () => {
			(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error')
			);

			await expect(sneakersService.getUserSneakers()).rejects.toThrow(
				'Network error'
			);
		});

		it('should handle API errors for user sneakers', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: () => Promise.resolve({ error: 'User not found' }),
			});

			await expect(sneakersService.getUserSneakers()).rejects.toThrow();
		});

		it('should handle unauthorized requests', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: () => Promise.resolve({ error: 'Unauthorized' }),
			});

			await expect(sneakersService.getUserSneakers()).rejects.toThrow();
		});
	});

	describe('error handling', () => {
		it('should handle malformed JSON responses in getUserSneakers', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.reject(new Error('Invalid JSON')),
			});

			await expect(sneakersService.getUserSneakers()).rejects.toThrow(
				'Invalid JSON'
			);
		});

		it('should propagate script errors correctly', async () => {
			const customError = new Error('Custom script error');
			mockAddSneaker.mockRejectedValueOnce(customError);

			await expect(sneakersService.add(mockSneaker)).rejects.toThrow(
				'Custom script error'
			);
		});
	});
});
