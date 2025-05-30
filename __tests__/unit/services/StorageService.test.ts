import { StorageService } from '@/services/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStorageItemAsync } from '@/hooks/useStorageState';
import { User } from '@/types/User';
import { Collection } from '@/types/Collection';
import { Sneaker } from '@/types/Sneaker';

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	getAllKeys: jest.fn(),
}));

jest.mock('@/hooks/useStorageState', () => ({
	setStorageItemAsync: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSetStorageItemAsync = setStorageItemAsync as jest.MockedFunction<
	typeof setStorageItemAsync
>;

const mockUser: User = {
	id: '1',
	email: 'test@example.com',
	password: 'password',
	username: 'testuser',
	first_name: 'John',
	last_name: 'Doe',
	sneaker_size: 42,
	profile_picture: { id: '1', url: 'test.jpg' },
	profile_picture_url: 'test.jpg',
	created_at: '2024-01-01',
	updated_at: '2024-01-01',
	friends: [],
	collection: {
		id: '1',
		name: 'Test Collection',
		user_id: '1',
		created_at: '2024-01-01',
		updated_at: '2024-01-01',
	},
	sneakers: [],
};

const mockCollection: Collection = {
	id: '1',
	name: 'Test Collection',
	user_id: '1',
	created_at: '2024-01-01',
	updated_at: '2024-01-01',
};

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
	images: [{ id: '1', url: 'test.jpg' }],
};

describe('StorageService', () => {
	let storageService: StorageService;

	beforeEach(() => {
		storageService = new StorageService();
		jest.clearAllMocks();
	});

	describe('getItem', () => {
		it('should retrieve and parse item from storage', async () => {
			const testValue = { name: 'test' };
			mockAsyncStorage.getItem.mockResolvedValueOnce(
				JSON.stringify(testValue)
			);

			const result = await storageService.getItem('test-key');

			expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
			expect(result).toEqual(testValue);
		});

		it('should return null when item does not exist', async () => {
			mockAsyncStorage.getItem.mockResolvedValueOnce(null);

			const result = await storageService.getItem('nonexistent-key');

			expect(result).toBeNull();
		});

		it('should handle storage errors', async () => {
			mockAsyncStorage.getItem.mockRejectedValueOnce(
				new Error('Storage error')
			);

			await expect(storageService.getItem('test-key')).rejects.toThrow(
				'Error retrieving test-key:: Error: Storage error'
			);
		});
	});

	describe('setItem', () => {
		it('should store regular item in AsyncStorage', async () => {
			const testValue = { name: 'test' };
			mockAsyncStorage.setItem.mockResolvedValueOnce();

			await storageService.setItem('test-key', testValue);

			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'test-key',
				JSON.stringify(testValue)
			);
		});

		it('should store sessionToken using setStorageItemAsync', async () => {
			const token = 'test-token';
			mockSetStorageItemAsync.mockResolvedValueOnce();

			await storageService.setItem('sessionToken', token);

			expect(mockSetStorageItemAsync).toHaveBeenCalledWith(
				'sessionToken',
				JSON.stringify(token)
			);
		});

		it('should handle storage errors when setting item', async () => {
			mockAsyncStorage.setItem.mockRejectedValueOnce(
				new Error('Storage full')
			);

			await expect(
				storageService.setItem('test-key', 'test-value')
			).rejects.toThrow('Error storing test-key:: Error: Storage full');
		});
	});

	describe('removeItem', () => {
		it('should remove item from storage', async () => {
			mockAsyncStorage.removeItem.mockResolvedValueOnce();

			await storageService.removeItem('test-key');

			expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
				'test-key'
			);
		});

		it('should handle storage errors when removing item', async () => {
			mockAsyncStorage.removeItem.mockRejectedValueOnce(
				new Error('Remove error')
			);

			await expect(storageService.removeItem('test-key')).rejects.toThrow(
				'Error removing test-key:: Error: Remove error'
			);
		});
	});

	describe('setSessionData', () => {
		it('should store session token and user data', async () => {
			mockSetStorageItemAsync.mockResolvedValueOnce();
			mockAsyncStorage.setItem.mockResolvedValueOnce();

			await storageService.setSessionData('test-token', mockUser);

			expect(mockSetStorageItemAsync).toHaveBeenCalledWith(
				'sessionToken',
				'test-token'
			);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'user',
				JSON.stringify(mockUser)
			);
		});

		it('should handle errors when storing session data', async () => {
			mockSetStorageItemAsync.mockRejectedValueOnce(
				new Error('Token error')
			);

			await expect(
				storageService.setSessionData('test-token', mockUser)
			).rejects.toThrow('Error storing session data:');
		});
	});

	describe('clearSessionData', () => {
		it('should clear all session-related data', async () => {
			mockSetStorageItemAsync.mockResolvedValueOnce();
			mockAsyncStorage.removeItem
				.mockResolvedValueOnce()
				.mockResolvedValueOnce()
				.mockResolvedValueOnce();

			await storageService.clearSessionData();

			expect(mockSetStorageItemAsync).toHaveBeenCalledWith(
				'sessionToken',
				null
			);
			expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('user');
			expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
				'collection'
			);
			expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
				'sneakers'
			);
		});

		it('should handle errors when clearing session data', async () => {
			mockSetStorageItemAsync.mockRejectedValueOnce(
				new Error('Clear error')
			);

			await expect(storageService.clearSessionData()).rejects.toThrow(
				'Error clearing session data:'
			);
		});
	});

	describe('setUserData/getUserData', () => {
		it('should store and retrieve user data', async () => {
			mockAsyncStorage.setItem.mockResolvedValueOnce();
			await storageService.setUserData(mockUser);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'user',
				JSON.stringify(mockUser)
			);

			mockAsyncStorage.getItem.mockResolvedValueOnce(
				JSON.stringify(mockUser)
			);
			const result = await storageService.getUserData();
			expect(result).toEqual(mockUser);
		});
	});

	describe('setCollectionData/getCollectionData', () => {
		it('should store and retrieve collection data', async () => {
			mockAsyncStorage.setItem.mockResolvedValueOnce();
			await storageService.setCollectionData(mockCollection);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'collection',
				JSON.stringify(mockCollection)
			);

			mockAsyncStorage.getItem.mockResolvedValueOnce(
				JSON.stringify(mockCollection)
			);
			const result = await storageService.getCollectionData();
			expect(result).toEqual(mockCollection);
		});
	});

	describe('setSneakersData/getSneakersData', () => {
		it('should store and retrieve sneakers data', async () => {
			const sneakers = [mockSneaker];
			mockAsyncStorage.setItem.mockResolvedValueOnce();
			await storageService.setSneakersData(sneakers);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'sneakers',
				JSON.stringify(sneakers)
			);

			mockAsyncStorage.getItem.mockResolvedValueOnce(
				JSON.stringify(sneakers)
			);
			const result = await storageService.getSneakersData();
			expect(result).toEqual(sneakers);
		});
	});

	describe('initializeStorageData', () => {
		it('should initialize and return all app state data', async () => {
			const sneakers = [mockSneaker];
			mockAsyncStorage.getItem
				.mockResolvedValueOnce(JSON.stringify(mockUser))
				.mockResolvedValueOnce(JSON.stringify(mockCollection))
				.mockResolvedValueOnce(JSON.stringify(sneakers));

			const result = await storageService.initializeStorageData();

			expect(result).toEqual({
				user: mockUser,
				collection: mockCollection,
				sneakers: sneakers,
			});
		});

		it('should handle missing data gracefully', async () => {
			mockAsyncStorage.getItem
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(null);

			const result = await storageService.initializeStorageData();

			expect(result).toEqual({
				user: null,
				collection: null,
				sneakers: null,
			});
		});

		it('should handle initialization errors', async () => {
			mockAsyncStorage.getItem.mockRejectedValueOnce(
				new Error('Init error')
			);

			await expect(
				storageService.initializeStorageData()
			).rejects.toThrow('Error initializing storage data:');
		});
	});

	describe('saveAppState', () => {
		it('should save complete app state', async () => {
			const appState = {
				user: mockUser,
				collection: mockCollection,
				sneakers: [mockSneaker],
			};

			mockAsyncStorage.setItem
				.mockResolvedValueOnce()
				.mockResolvedValueOnce()
				.mockResolvedValueOnce();

			await storageService.saveAppState(appState);

			expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(3);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'user',
				JSON.stringify(mockUser)
			);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'collection',
				JSON.stringify(mockCollection)
			);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'sneakers',
				JSON.stringify([mockSneaker])
			);
		});

		it('should save partial app state', async () => {
			const appState = {
				user: mockUser,
				collection: null,
				sneakers: null,
			};

			mockAsyncStorage.setItem.mockResolvedValueOnce();

			await storageService.saveAppState(appState);

			expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
			expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
				'user',
				JSON.stringify(mockUser)
			);
		});

		it('should handle save errors', async () => {
			const appState = {
				user: mockUser,
				collection: null,
				sneakers: null,
			};

			mockAsyncStorage.setItem.mockRejectedValueOnce(
				new Error('Save error')
			);

			await expect(storageService.saveAppState(appState)).rejects.toThrow(
				'Error saving app state:'
			);
		});
	});
});
