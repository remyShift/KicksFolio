import { describe, expect, it, vi } from 'vitest';

import { FollowerInterface } from '@/interfaces/FollowerInterface';
import { FollowingUser, SearchUser } from '@/types/user';

describe('FollowerInterface', () => {
	describe('followUser', () => {
		it('should successfully follow a user', async () => {
			const mockFollowFunction = vi.fn().mockResolvedValue(true);

			const result = await FollowerInterface.followUser(
				'user-to-follow-id',
				mockFollowFunction
			);

			expect(result).toBe(true);
			expect(mockFollowFunction).toHaveBeenCalledWith(
				'user-to-follow-id'
			);
		});

		it('should handle follow errors gracefully', async () => {
			const mockError = new Error('Follow failed');
			const mockFollowFunction = vi.fn().mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				FollowerInterface.followUser(
					'user-to-follow-id',
					mockFollowFunction
				)
			).rejects.toThrow('Follow failed');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ FollowerInterface.followUser: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('unfollowUser', () => {
		it('should successfully unfollow a user', async () => {
			const mockUnfollowFunction = vi.fn().mockResolvedValue(true);

			const result = await FollowerInterface.unfollowUser(
				'user-to-unfollow-id',
				mockUnfollowFunction
			);

			expect(result).toBe(true);
			expect(mockUnfollowFunction).toHaveBeenCalledWith(
				'user-to-unfollow-id'
			);
		});

		it('should handle unfollow errors gracefully', async () => {
			const mockError = new Error('Unfollow failed');
			const mockUnfollowFunction = vi.fn().mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				FollowerInterface.unfollowUser(
					'user-to-unfollow-id',
					mockUnfollowFunction
				)
			).rejects.toThrow('Unfollow failed');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ FollowerInterface.unfollowUser: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getFollowingUsers', () => {
		it('should return following users list', async () => {
			const mockFollowingUsers: FollowingUser[] = [
				{
					id: '1',
					username: 'user1',
					first_name: 'John',
					last_name: 'Doe',
					profile_picture: null,
					is_following: true,
					followers_count: 10,
					following_count: 5,
					sneakers: [],
					followed_at: '2023-01-01T00:00:00.000Z',
				},
			];

			const mockGetFollowingFunction = vi
				.fn()
				.mockResolvedValue(mockFollowingUsers);

			const result = await FollowerInterface.getFollowingUsers(
				'user-id',
				mockGetFollowingFunction
			);

			expect(result).toEqual(mockFollowingUsers);
			expect(mockGetFollowingFunction).toHaveBeenCalledWith('user-id');
		});

		it('should handle getFollowingUsers errors gracefully', async () => {
			const mockError = new Error('Failed to get following users');
			const mockGetFollowingFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				FollowerInterface.getFollowingUsers(
					'user-id',
					mockGetFollowingFunction
				)
			).rejects.toThrow('Failed to get following users');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ FollowerInterface.getFollowingUsers: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getFollowersOfUser', () => {
		it('should return followers list', async () => {
			const mockFollowers: SearchUser[] = [
				{
					id: '1',
					username: 'follower1',
					first_name: 'Jane',
					last_name: 'Smith',
					profile_picture: null,
					is_following: false,
					followers_count: 5,
					following_count: 10,
					sneakers: [],
				},
			];

			const mockGetFollowersFunction = vi
				.fn()
				.mockResolvedValue(mockFollowers);

			const result = await FollowerInterface.getFollowersOfUser(
				'user-id',
				mockGetFollowersFunction
			);

			expect(result).toEqual(mockFollowers);
			expect(mockGetFollowersFunction).toHaveBeenCalledWith('user-id');
		});

		it('should handle getFollowersOfUser errors gracefully', async () => {
			const mockError = new Error('Failed to get followers');
			const mockGetFollowersFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				FollowerInterface.getFollowersOfUser(
					'user-id',
					mockGetFollowersFunction
				)
			).rejects.toThrow('Failed to get followers');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ FollowerInterface.getFollowersOfUser: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('isFollowing', () => {
		it('should return true when user is following', async () => {
			const mockIsFollowingFunction = vi.fn().mockResolvedValue(true);

			const result = await FollowerInterface.isFollowing(
				'follower-id',
				'following-id',
				mockIsFollowingFunction
			);

			expect(result).toBe(true);
			expect(mockIsFollowingFunction).toHaveBeenCalledWith(
				'follower-id',
				'following-id'
			);
		});

		it('should return false when user is not following', async () => {
			const mockIsFollowingFunction = vi.fn().mockResolvedValue(false);

			const result = await FollowerInterface.isFollowing(
				'follower-id',
				'following-id',
				mockIsFollowingFunction
			);

			expect(result).toBe(false);
			expect(mockIsFollowingFunction).toHaveBeenCalledWith(
				'follower-id',
				'following-id'
			);
		});

		it('should handle isFollowing errors gracefully', async () => {
			const mockError = new Error('Failed to check following status');
			const mockIsFollowingFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				FollowerInterface.isFollowing(
					'follower-id',
					'following-id',
					mockIsFollowingFunction
				)
			).rejects.toThrow('Failed to check following status');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ FollowerInterface.isFollowing: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('getFollowCounts', () => {
		it('should return follow counts', async () => {
			const mockCounts = {
				followers: 10,
				following: 5,
			};
			const mockGetFollowCountsFunction = vi
				.fn()
				.mockResolvedValue(mockCounts);

			const result = await FollowerInterface.getFollowCounts(
				'user-id',
				mockGetFollowCountsFunction
			);

			expect(result).toEqual(mockCounts);
			expect(mockGetFollowCountsFunction).toHaveBeenCalledWith('user-id');
		});

		it('should handle getFollowCounts errors gracefully', async () => {
			const mockError = new Error('Failed to get follow counts');
			const mockGetFollowCountsFunction = vi
				.fn()
				.mockRejectedValue(mockError);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await expect(
				FollowerInterface.getFollowCounts(
					'user-id',
					mockGetFollowCountsFunction
				)
			).rejects.toThrow('Failed to get follow counts');

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ FollowerInterface.getFollowCounts: Error occurred:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});
});
