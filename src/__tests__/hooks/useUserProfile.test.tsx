import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useUserProfile } from '@/hooks/useUserProfile';
import { SearchUser } from '@/types/user';

vi.mock('@/interfaces/UserSearch', () => ({
	UserSearch: {
		getUserProfile: vi.fn(),
		getUserSneakers: vi.fn(),
	},
}));

vi.mock('@/interfaces/FollowerHandler', () => ({
	FollowerHandler: {
		followUser: vi.fn(),
		unfollowUser: vi.fn(),
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
	let UserSearch: any;
	let FollowerHandler: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		UserSearch = (await import('@/domain/UserSearch')).UserSearch;
		FollowerHandler = (await import('@/domain/FollowerHandler'))
			.FollowerHandler;
	});

	it('should initialize with correct default values', () => {
		const { result } = renderHook(() => useUserProfile('test-user-id'));

		expect(result.current.userProfile).toBeNull();
		expect(result.current.isLoading).toBe(true);
		expect(result.current.isFollowLoading).toBe(false);
		expect(result.current.refreshing).toBe(false);
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

			UserSearch.getUserProfile.mockResolvedValue(mockUserProfile);
			UserSearch.getUserSneakers.mockResolvedValue(mockSneakers);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(result.current.userProfile).toEqual({
				userSearch: mockUserProfile,
				sneakers: mockSneakers,
			});
			expect(result.current.isLoading).toBe(false);
		});

		it('should handle user not found', async () => {
			UserSearch.getUserProfile.mockResolvedValue(null);
			UserSearch.getUserSneakers.mockResolvedValue([]);

			renderHook(() => useUserProfile('nonexistent-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(mockToast.showErrorToast).toHaveBeenCalledWith(
				'Utilisateur introuvable',
				"Cet utilisateur n'existe pas ou n'est plus disponible."
			);
			const { router } = await import('expo-router');
			expect(router.back).toHaveBeenCalled();
		});

		it('should handle load errors gracefully', async () => {
			const mockError = new Error('Load failed');
			UserSearch.getUserProfile.mockRejectedValue(mockError);
			UserSearch.getUserSneakers.mockRejectedValue(mockError);

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				'Error loading user profile:',
				mockError
			);
			expect(mockToast.showErrorToast).toHaveBeenCalledWith(
				'Erreur de chargement',
				'Impossible de charger le profil utilisateur.'
			);

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

			UserSearch.getUserProfile.mockResolvedValue(mockUserProfile);
			UserSearch.getUserSneakers.mockResolvedValue([]);
			FollowerHandler.followUser.mockResolvedValue(true);
			mockRefreshFollowingUsers.mockResolvedValue(undefined);
			mockRefreshUserData.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(FollowerHandler.followUser).toHaveBeenCalledWith(
				'test-user-id',
				expect.any(Function)
			);
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

			UserSearch.getUserProfile.mockResolvedValue(mockUserProfile);
			UserSearch.getUserSneakers.mockResolvedValue([]);
			FollowerHandler.unfollowUser.mockResolvedValue(true);
			mockRefreshFollowingUsers.mockResolvedValue(undefined);
			mockRefreshUserData.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(FollowerHandler.unfollowUser).toHaveBeenCalledWith(
				'test-user-id',
				expect.any(Function)
			);
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
			UserSearch.getUserProfile.mockResolvedValue(mockUserProfile);
			UserSearch.getUserSneakers.mockResolvedValue([]);
			FollowerHandler.followUser.mockRejectedValue(mockError);

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

			expect(FollowerHandler.followUser).not.toHaveBeenCalled();
			expect(FollowerHandler.unfollowUser).not.toHaveBeenCalled();
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

			UserSearch.getUserProfile.mockResolvedValue(mockUserProfile);
			UserSearch.getUserSneakers.mockResolvedValue([]);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await result.current.refreshUserProfile();
			});

			expect(UserSearch.getUserProfile).toHaveBeenCalled();
			expect(UserSearch.getUserSneakers).toHaveBeenCalled();
			expect(result.current.refreshing).toBe(false);
		});

		it('should handle refresh errors gracefully', async () => {
			const mockError = new Error('Refresh failed');
			UserSearch.getUserProfile.mockRejectedValue(mockError);
			UserSearch.getUserSneakers.mockRejectedValue(mockError);

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

			expect(UserSearch.getUserProfile).not.toHaveBeenCalled();
			expect(UserSearch.getUserSneakers).not.toHaveBeenCalled();
		});
	});
});
