import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { SearchUser } from '@/domain/UserSearchProvider';
import { useUserProfile } from '@/hooks/useUserProfile';

vi.mock('@/interfaces/UserSearchInterface', () => ({
	UserSearchInterface: {
		getUserProfile: vi.fn(),
		getUserSneakers: vi.fn(),
	},
}));

vi.mock('@/interfaces/FollowerInterface', () => ({
	FollowerInterface: {
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

vi.mock('@/context/authContext', () => ({
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
	let UserSearchInterface: any;
	let FollowerInterface: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		UserSearchInterface = (await import('@/interfaces/UserSearchInterface'))
			.UserSearchInterface;
		FollowerInterface = (await import('@/interfaces/FollowerInterface'))
			.FollowerInterface;
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

			UserSearchInterface.getUserProfile.mockResolvedValue(
				mockUserProfile
			);
			UserSearchInterface.getUserSneakers.mockResolvedValue(mockSneakers);

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
			UserSearchInterface.getUserProfile.mockResolvedValue(null);
			UserSearchInterface.getUserSneakers.mockResolvedValue([]);

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
			UserSearchInterface.getUserProfile.mockRejectedValue(mockError);
			UserSearchInterface.getUserSneakers.mockRejectedValue(mockError);

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

			UserSearchInterface.getUserProfile.mockResolvedValue(
				mockUserProfile
			);
			UserSearchInterface.getUserSneakers.mockResolvedValue([]);
			FollowerInterface.followUser.mockResolvedValue(true);
			mockRefreshFollowingUsers.mockResolvedValue(undefined);
			mockRefreshUserData.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(FollowerInterface.followUser).toHaveBeenCalledWith(
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

			UserSearchInterface.getUserProfile.mockResolvedValue(
				mockUserProfile
			);
			UserSearchInterface.getUserSneakers.mockResolvedValue([]);
			FollowerInterface.unfollowUser.mockResolvedValue(true);
			mockRefreshFollowingUsers.mockResolvedValue(undefined);
			mockRefreshUserData.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(FollowerInterface.unfollowUser).toHaveBeenCalledWith(
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
			UserSearchInterface.getUserProfile.mockResolvedValue(
				mockUserProfile
			);
			UserSearchInterface.getUserSneakers.mockResolvedValue([]);
			FollowerInterface.followUser.mockRejectedValue(mockError);

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
				'Erreur',
				'Impossible de modifier le suivi pour le moment.'
			);

			consoleSpy.mockRestore();
		});

		it('should not execute if user profile is null', async () => {
			const { result } = renderHook(() => useUserProfile(undefined));

			await act(async () => {
				await result.current.handleFollowToggle();
			});

			expect(FollowerInterface.followUser).not.toHaveBeenCalled();
			expect(FollowerInterface.unfollowUser).not.toHaveBeenCalled();
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

			UserSearchInterface.getUserProfile.mockResolvedValue(
				mockUserProfile
			);
			UserSearchInterface.getUserSneakers.mockResolvedValue([]);

			const { result } = renderHook(() => useUserProfile('test-user-id'));

			await act(async () => {
				await result.current.refreshUserProfile();
			});

			expect(UserSearchInterface.getUserProfile).toHaveBeenCalled();
			expect(UserSearchInterface.getUserSneakers).toHaveBeenCalled();
			expect(result.current.refreshing).toBe(false);
		});

		it('should handle refresh errors gracefully', async () => {
			const mockError = new Error('Refresh failed');
			UserSearchInterface.getUserProfile.mockRejectedValue(mockError);
			UserSearchInterface.getUserSneakers.mockRejectedValue(mockError);

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

			expect(UserSearchInterface.getUserProfile).not.toHaveBeenCalled();
			expect(UserSearchInterface.getUserSneakers).not.toHaveBeenCalled();
		});
	});
});
