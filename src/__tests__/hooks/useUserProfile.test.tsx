import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useUserProfile } from '@/hooks/useUserProfile';
import { SearchUser } from '@/types/user';

vi.mock('@/tech/proxy/UserLookupProxy', () => ({
	userLookupProxy: {
		getProfile: vi.fn(),
		getSneakers: vi.fn(),
	},
}));

vi.mock('@/tech/proxy/FollowerProxy', () => ({
	followerProxy: {
		follow: vi.fn(),
		unfollow: vi.fn(),
	},
}));

const mockUser = {
	id: 'current-user-id',
	username: 'currentuser',
	email: 'current@example.com',
};

const mockRefreshFollowingUsers = vi.fn();
const mockRefreshUserData = vi.fn();

vi.mock('@/contexts/authContext', () => ({
	useSession: () => ({
		user: mockUser,
		refreshFollowingUsers: mockRefreshFollowingUsers,
		refreshUserData: mockRefreshUserData,
	}),
}));

const mockToast = {
	showSuccessToast: vi.fn(),
	showErrorToast: vi.fn(),
};

vi.mock('@/hooks/ui/useToast', () => ({
	__esModule: true,
	default: () => mockToast,
}));

vi.mock('expo-router', () => ({
	router: {
		back: vi.fn(),
	},
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => {
			const translations: Record<string, string> = {
				'social.unfollowed': 'Unfollowed',
				'social.unfollowedDesc': `You unfollowed ${options?.username}`,
				'social.followed': 'Followed',
				'social.followedDesc': `You followed ${options?.username}`,
			};
			return options
				? translations[key]?.replace(
						'${options?.username}',
						options.username
					) || key
				: translations[key] || key;
		},
	}),
}));

describe('useUserProfile', () => {
	let userLookupProxy: any;
	let followerProxy: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		userLookupProxy = (await import('@/tech/proxy/UserLookupProxy'))
			.userLookupProxy;
		followerProxy = (await import('@/tech/proxy/FollowerProxy'))
			.followerProxy;
	});

	it('should initialize with correct default values', () => {
		const { result } = renderHook(() => useUserProfile('test-user-id'));

		expect(result.current.userProfile).toBeNull();
		expect(result.current.isFollowLoading).toBe(false);
		expect(result.current.refreshing).toBe(false);
		expect(result.current.hasError).toBe(false);
	});

	describe('loadUserProfile', () => {
		it('should load user profile and sneakers successfully', async () => {
			const mockUserProfile: SearchUser = {
				id: 'test-user-id',
				username: 'testuser',
				first_name: 'Test',
				last_name: 'User',
				profile_picture: null,
				is_following: false,
				followers_count: 10,
				following_count: 5,
				sneakers: [],
			};

			const mockSneakers = [
				{
					id: '1',
					brand: 'Nike',
					model: 'Air Max',
					size: 42,
					condition: 9,
					price: 150,
				},
			];

			userLookupProxy.getProfile.mockResolvedValue(mockUserProfile);
			userLookupProxy.getSneakers.mockResolvedValue(mockSneakers);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(result.current.userProfile).toEqual({
				userSearch: mockUserProfile,
				sneakers: mockSneakers,
			});
			expect(result.current.hasError).toBe(false);
		});

		it('should handle user not found', async () => {
			userLookupProxy.getProfile.mockResolvedValue(null);
			userLookupProxy.getSneakers.mockResolvedValue([]);

			const { result } = renderHook(() =>
				useUserProfile('nonexistent-user-id')
			);

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(result.current.hasError).toBe(true);
			expect(result.current.userProfile).toBeNull();
		});

		it('should handle load errors gracefully', async () => {
			const mockError = new Error('Load failed');
			userLookupProxy.getProfile.mockRejectedValue(mockError);
			userLookupProxy.getSneakers.mockRejectedValue(mockError);

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				'Error loading user profile:',
				mockError
			);
			expect(result.current.hasError).toBe(true);
			expect(result.current.userProfile).toBeNull();

			consoleSpy.mockRestore();
		});
	});

	describe('handleFollowToggle', () => {
		it('should follow a user successfully', async () => {
			const mockUserProfile: SearchUser = {
				id: 'test-user-id',
				username: 'testuser',
				first_name: 'Test',
				last_name: 'User',
				profile_picture: null,
				is_following: false,
				followers_count: 10,
				following_count: 5,
				sneakers: [],
			};

			userLookupProxy.getProfile.mockResolvedValue(mockUserProfile);
			userLookupProxy.getSneakers.mockResolvedValue([]);
			followerProxy.follow.mockResolvedValue(true);
			mockRefreshFollowingUsers.mockResolvedValue(undefined);
			mockRefreshUserData.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(followerProxy.follow).toHaveBeenCalledWith('test-user-id');
			expect(mockToast.showSuccessToast).toHaveBeenCalledWith(
				'Followed',
				'You followed testuser'
			);
			expect(result.current.userProfile?.userSearch.is_following).toBe(
				true
			);
			expect(result.current.userProfile?.userSearch.followers_count).toBe(
				11
			);
		});

		it('should unfollow a user successfully', async () => {
			const mockUserProfile: SearchUser = {
				id: 'test-user-id',
				username: 'testuser',
				first_name: 'Test',
				last_name: 'User',
				profile_picture: null,
				is_following: true,
				followers_count: 10,
				following_count: 5,
				sneakers: [],
			};

			userLookupProxy.getProfile.mockResolvedValue(mockUserProfile);
			userLookupProxy.getSneakers.mockResolvedValue([]);
			followerProxy.unfollow.mockResolvedValue(true);
			mockRefreshFollowingUsers.mockResolvedValue(undefined);
			mockRefreshUserData.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(followerProxy.unfollow).toHaveBeenCalledWith('test-user-id');
			expect(mockToast.showSuccessToast).toHaveBeenCalledWith(
				'Unfollowed',
				'You unfollowed testuser'
			);
			expect(result.current.userProfile?.userSearch.is_following).toBe(
				false
			);
			expect(result.current.userProfile?.userSearch.followers_count).toBe(
				9
			);
		});

		it('should handle follow toggle errors gracefully', async () => {
			const mockUserProfile: SearchUser = {
				id: 'test-user-id',
				username: 'testuser',
				first_name: 'Test',
				last_name: 'User',
				profile_picture: null,
				is_following: false,
				followers_count: 10,
				following_count: 5,
				sneakers: [],
			};

			const mockError = new Error('Follow failed');
			userLookupProxy.getProfile.mockResolvedValue(mockUserProfile);
			userLookupProxy.getSneakers.mockResolvedValue([]);
			followerProxy.follow.mockRejectedValue(mockError);

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				'Error toggling follow:',
				mockError
			);
			expect(mockToast.showErrorToast).toHaveBeenCalledWith(
				'Error',
				'Unable to toggle follow for now.'
			);

			consoleSpy.mockRestore();
		});

		it('should not execute if user profile is null', async () => {
			const { result } = renderHook(() => useUserProfile(undefined));

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(followerProxy.follow).not.toHaveBeenCalled();
			expect(followerProxy.unfollow).not.toHaveBeenCalled();
		});
	});

	describe('refreshUserProfile', () => {
		it('should refresh user profile successfully', async () => {
			const mockUserProfile: SearchUser = {
				id: 'test-user-id',
				username: 'testuser',
				first_name: 'Test',
				last_name: 'User',
				profile_picture: null,
				is_following: false,
				followers_count: 10,
				following_count: 5,
				sneakers: [],
			};

			userLookupProxy.getProfile.mockResolvedValue(mockUserProfile);
			userLookupProxy.getSneakers.mockResolvedValue([]);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await result.current.refreshUserProfile();
			});

			expect(userLookupProxy.getProfile).toHaveBeenCalled();
			expect(userLookupProxy.getSneakers).toHaveBeenCalled();
			expect(result.current.refreshing).toBe(false);
		});

		it('should handle refresh errors gracefully', async () => {
			const mockError = new Error('Refresh failed');
			userLookupProxy.getProfile.mockRejectedValue(mockError);
			userLookupProxy.getSneakers.mockRejectedValue(mockError);

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await result.current.refreshUserProfile();
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				'Error loading user profile:',
				mockError
			);

			consoleSpy.mockRestore();
		});
	});

	describe('edge cases', () => {
		it('should not load profile if userId is undefined', () => {
			renderHook(() => useUserProfile(undefined));

			expect(userLookupProxy.getProfile).not.toHaveBeenCalled();
			expect(userLookupProxy.getSneakers).not.toHaveBeenCalled();
		});
	});
});
