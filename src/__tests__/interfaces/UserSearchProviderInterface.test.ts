import { describe, expect, it, vi } from 'vitest';

import { SearchUser, SearchUsersResponse } from '@/domain/UserSearchProvider';
import { UserSearchInterface } from '@/interfaces/UserSearchInterface';

describe('UserSearchInterface', () => {
	describe('searchUsers', () => {
		it('should return search results when users are found', async () => {
			const mockSearchResponse: SearchUsersResponse = {
				users: [
					{
						id: '1',
						username: 'testuser',
						first_name: 'Test',
						last_name: 'User',
						profile_picture: null,
						is_following: false,
						followers_count: 10,
						following_count: 5,
						sneakers: [],
					},
				],
				hasMore: false,
				totalCount: 1,
			};

			const mockSearchFunction = vi
				.fn()
				.mockResolvedValue(mockSearchResponse);

			const result = await UserSearchInterface.searchUsers(
				'test',
				'current-user-id',
				0,
				mockSearchFunction
			);

			expect(result).toEqual(mockSearchResponse);
			expect(mockSearchFunction).toHaveBeenCalledWith(
				'test',
				'current-user-id',
				0
			);
		});

		it('should return empty results for empty search term', async () => {
			const mockSearchResponse: SearchUsersResponse = {
				users: [],
				hasMore: false,
				totalCount: 0,
			};

			const mockSearchFunction = vi
				.fn()
				.mockResolvedValue(mockSearchResponse);

			const result = await UserSearchInterface.searchUsers(
				'',
				'current-user-id',
				0,
				mockSearchFunction
			);

			expect(result).toEqual(mockSearchResponse);
			expect(mockSearchFunction).toHaveBeenCalledWith(
				'',
				'current-user-id',
				0
			);
		});

		it('should handle search errors gracefully', async () => {
			const mockError = new Error('Search failed');
			const mockSearchFunction = vi.fn().mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				UserSearchInterface.searchUsers(
					'test',
					'current-user-id',
					0,
					mockSearchFunction
				)
			).rejects.toThrow('Search failed');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ UserSearchInterface.searchUsers: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getUserProfile', () => {
		it('should return user profile when user exists', async () => {
			const mockUser: SearchUser = {
				id: '1',
				username: 'testuser',
				first_name: 'Test',
				last_name: 'User',
				profile_picture: null,
				is_following: false,
				followers_count: 10,
				following_count: 5,
				sneakers: [],
			};

			const mockGetUserProfileFunction = vi
				.fn()
				.mockResolvedValue(mockUser);

			const result = await UserSearchInterface.getUserProfile(
				'1',
				'current-user-id',
				mockGetUserProfileFunction
			);

			expect(result).toEqual(mockUser);
			expect(mockGetUserProfileFunction).toHaveBeenCalledWith(
				'1',
				'current-user-id'
			);
		});

		it('should return null when user not found', async () => {
			const mockGetUserProfileFunction = vi.fn().mockResolvedValue(null);

			const result = await UserSearchInterface.getUserProfile(
				'nonexistent',
				'current-user-id',
				mockGetUserProfileFunction
			);

			expect(result).toBeNull();
			expect(mockGetUserProfileFunction).toHaveBeenCalledWith(
				'nonexistent',
				'current-user-id'
			);
		});

		it('should handle getUserProfile errors gracefully', async () => {
			const mockError = new Error('Profile fetch failed');
			const mockGetUserProfileFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				UserSearchInterface.getUserProfile(
					'1',
					'current-user-id',
					mockGetUserProfileFunction
				)
			).rejects.toThrow('Profile fetch failed');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ UserSearchInterface.getUserProfile: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getUserSneakers', () => {
		it('should return user sneakers when found', async () => {
			const mockSneakers = [
				{
					id: '1',
					brand: 'Nike',
					model: 'Air Max',
					size: 42,
					condition: 9,
					price: 150,
					images: [
						{
							id: '1',
							uri: 'image.jpg',
						},
					],
				},
			];

			const mockGetUserSneakersFunction = vi
				.fn()
				.mockResolvedValue(mockSneakers);

			const result = await UserSearchInterface.getUserSneakers(
				'user-id',
				mockGetUserSneakersFunction
			);

			expect(result).toEqual(mockSneakers);
			expect(mockGetUserSneakersFunction).toHaveBeenCalledWith('user-id');
		});

		it('should return empty array when no sneakers found', async () => {
			const mockGetUserSneakersFunction = vi.fn().mockResolvedValue([]);

			const result = await UserSearchInterface.getUserSneakers(
				'user-id',
				mockGetUserSneakersFunction
			);

			expect(result).toEqual([]);
			expect(mockGetUserSneakersFunction).toHaveBeenCalledWith('user-id');
		});

		it('should handle getUserSneakers errors gracefully', async () => {
			const mockError = new Error('Sneakers fetch failed');
			const mockGetUserSneakersFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				UserSearchInterface.getUserSneakers(
					'user-id',
					mockGetUserSneakersFunction
				)
			).rejects.toThrow('Sneakers fetch failed');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ UserSearchInterface.getUserSneakers: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});
});
