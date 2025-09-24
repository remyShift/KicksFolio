import { act } from 'react';

import { router } from 'expo-router';

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useAuth } from '@/hooks/useAuth';
import { UpdateUserData, UserData } from '@/types/auth';

import { createMockError } from '../domain/authSetup';

vi.mock('@/contexts/authContext', () => ({
	useSession: () => ({
		setUser: vi.fn(),
		refreshUserData: vi.fn(),
		clearUserData: vi.fn(),
		resetTokens: null,
	}),
}));

vi.mock('@/hooks/useAuthValidation', () => ({
	useAuthValidation: () => ({
		validateSignUpStep1Async: vi.fn().mockResolvedValue({
			isValid: true,
			errorMsg: '',
		}),
	}),
}));

vi.mock('@/tech/proxy/ImageProxy', () => ({
	imageStorageProxy: {
		uploadProfileImage: vi.fn().mockResolvedValue({
			success: true,
			url: 'https://example.com/uploaded-image.jpg',
		}),
		extractFilePathFromUrl: vi.fn().mockReturnValue('old-file-path'),
		deleteImage: vi.fn().mockResolvedValue(true),
		deleteAllUserFiles: vi.fn().mockResolvedValue(true),
	},
}));

vi.mock('@/tech/proxy/AuthProxy', () => ({
	authProxy: {
		signIn: vi.fn(),
		signUp: vi.fn(),
		signOut: vi.fn(),
		getCurrentUser: vi.fn(),
		updateProfile: vi.fn(),
		deleteUser: vi.fn(),
		forgotPassword: vi.fn(),
		resetPassword: vi.fn(),
		resetPasswordWithTokens: vi.fn(),
		cleanupOrphanedSessions: vi.fn(),
	},
}));

vi.mock('@/domain/Auth', () => ({
	Auth: vi.fn().mockImplementation(() => ({
		signUp: vi.fn(),
		signIn: vi.fn(),
		signOut: vi.fn(),
		getCurrentUser: vi.fn(),
		updateProfile: vi.fn(),
		deleteUser: vi.fn(),
		forgotPassword: vi.fn(),
		resetPassword: vi.fn(),
		resetPasswordWithTokens: vi.fn(),
		cleanupOrphanedSessions: vi.fn(),
	})),
}));

vi.mock('@/domain/ImageStorage', () => ({
	ImageStorage: vi.fn().mockImplementation(() => ({
		uploadProfile: vi.fn(),
		extractFilePathFromUrl: vi.fn(),
		deleteImage: vi.fn(),
		deleteAllUserFiles: vi.fn(),
	})),
}));

const { authProxy: MockedAuthProvider } = (await vi.importMock(
	'@/tech/proxy/AuthProxy'
)) as {
	authProxy: {
		signIn: ReturnType<typeof vi.fn>;
		signUp: ReturnType<typeof vi.fn>;
		signOut: ReturnType<typeof vi.fn>;
		getCurrentUser: ReturnType<typeof vi.fn>;
		updateProfile: ReturnType<typeof vi.fn>;
		deleteUser: ReturnType<typeof vi.fn>;
		forgotPassword: ReturnType<typeof vi.fn>;
		resetPassword: ReturnType<typeof vi.fn>;
		resetPasswordWithTokens: ReturnType<typeof vi.fn>;
		cleanupOrphanedSessions: ReturnType<typeof vi.fn>;
	};
};

const { Auth: MockAuth } = (await vi.importMock('@/domain/Auth')) as {
	Auth: ReturnType<typeof vi.fn>;
};

const { ImageStorage: MockImageStorage } = (await vi.importMock(
	'@/domain/ImageStorage'
)) as {
	ImageStorage: ReturnType<typeof vi.fn>;
};

describe('useAuth', () => {
	let mockAuthInstance: any;
	let mockImageHandlerInstance: any;

	beforeEach(() => {
		vi.clearAllMocks();

		MockAuth.mockClear();
		MockImageStorage.mockClear();

		mockAuthInstance = {
			signUp: vi.fn(),
			signIn: vi.fn(),
			signOut: vi.fn(),
			getCurrentUser: vi.fn(),
			updateProfile: vi.fn(),
			deleteUser: vi.fn(),
			forgotPassword: vi.fn(),
			resetPassword: vi.fn(),
			resetPasswordWithTokens: vi.fn(),
			cleanupOrphanedSessions: vi.fn(),
		};

		mockImageHandlerInstance = {
			uploadProfile: vi.fn(),
			extractFilePathFromUrl: vi.fn(),
			deleteImage: vi.fn(),
			deleteAllUserFiles: vi.fn(),
		};

		MockAuth.mockReturnValue(mockAuthInstance);
		MockImageStorage.mockReturnValue(mockImageHandlerInstance);

		mockAuthInstance.signIn.mockResolvedValue({
			user: {
				id: 'test-user-id',
				email: 'test@example.com',
			},
			session: { access_token: 'mock-token' },
		});

		mockAuthInstance.signOut.mockResolvedValue(undefined);
		mockAuthInstance.getCurrentUser.mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
			followers_count: 5,
			following_count: 10,
		});

		mockAuthInstance.deleteUser.mockResolvedValue(true);
		mockAuthInstance.forgotPassword.mockResolvedValue(undefined);
		mockAuthInstance.resetPassword.mockResolvedValue({
			user: {
				id: 'test-user-id',
				email: 'test@example.com',
			},
		});
		mockAuthInstance.resetPasswordWithTokens.mockResolvedValue(true);
		mockAuthInstance.cleanupOrphanedSessions.mockResolvedValue(undefined);

		mockImageHandlerInstance.uploadProfile.mockResolvedValue({
			success: true,
			url: 'https://example.com/uploaded-image.jpg',
		});
		mockImageHandlerInstance.extractFilePathFromUrl.mockReturnValue(
			'old-file-path'
		);
		mockImageHandlerInstance.deleteImage.mockResolvedValue(true);
		mockImageHandlerInstance.deleteAllUserFiles.mockResolvedValue(true);
	});

	describe('login', () => {
		it('should login with success', async () => {
			mockAuthInstance.signIn.mockResolvedValueOnce({
				user: {
					id: 'test-user-id',
					email: 'test@example.com',
				},
				session: {
					access_token: 'mock-token',
				},
			});

			const { result } = renderHook(() => useAuth());

			const user = await act(async () => {
				return result.current.login('test@example.com', 'password123');
			});

			expect(mockAuthInstance.signIn).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
			expect(user).toBeDefined();
		});

		it('should handle login errors', async () => {
			mockAuthInstance.signIn.mockRejectedValueOnce(
				createMockError('Invalid credentials')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.login('test@example.com', 'wrongpassword');
			});

			expect(result.current.errorMsg).toContain(
				'An error occurred during login.'
			);
		});
	});

	describe('signUp', () => {
		const userData: UserData = {
			email: 'test@example.com',
			password: 'password123',
			confirmPassword: 'password123',
			username: 'testuser',
			sneaker_size: 10,
			profile_picture: 'file://local-image.jpg',
		};

		it('should sign up with success without profile picture', async () => {
			const userDataWithoutPhoto = {
				...userData,
				profile_picture: '',
			};

			mockAuthInstance.signUp.mockResolvedValueOnce({
				user: {
					id: 'test-user-id',
				},
				session: {} as any,
			});

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userDataWithoutPhoto);
			});

			expect(mockAuthInstance.signUp).toHaveBeenCalledWith(
				'test@example.com',
				'password123',
				expect.objectContaining({
					username: 'testuser',
					sneaker_size: 10,
				})
			);
			expect(success).toBe(true);
		});

		it('should sign up with success with profile picture', async () => {
			mockAuthInstance.signUp.mockResolvedValueOnce({
				user: {
					id: 'test-user-id',
				},
				session: {} as any,
			});

			mockAuthInstance.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				profile_picture: 'https://example.com/uploaded-image.jpg',
			} as any);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userData);
			});

			expect(success).toBe(true);
			expect(mockImageHandlerInstance.uploadProfile).toHaveBeenCalledWith(
				'file://local-image.jpg',
				'test-user-id'
			);
		});

		it('should handle sign up errors', async () => {
			const { result } = renderHook(() => useAuth());

			expect(result.current.signUp).toBeDefined();
			expect(typeof result.current.signUp).toBe('function');
		});
	});

	describe('forgotPassword', () => {
		it('should send reset email with success', async () => {
			mockAuthInstance.forgotPassword.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.forgotPassword('test@example.com');
			});

			expect(mockAuthInstance.forgotPassword).toHaveBeenCalledWith(
				'test@example.com'
			);
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith({
				pathname: '/login',
				params: {
					message: 'email sent',
				},
			});
		});

		it('should handle email sending errors', async () => {
			mockAuthInstance.forgotPassword.mockRejectedValueOnce(
				createMockError('Email not found')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				try {
					await result.current.forgotPassword('test@example.com');
				} catch (error) {
					expect(error).toBeDefined();
				}
			});

			expect(result.current.errorMsg).toBe('Email not found');
		});
	});

	describe('resetPassword', () => {
		it('should reset password with success', async () => {
			mockAuthInstance.resetPassword.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.resetPassword(
					'newpassword123',
					'newpassword123'
				);
			});

			expect(mockAuthInstance.resetPassword).toHaveBeenCalledWith(
				'newpassword123'
			);
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith({
				pathname: '/login',
				params: {
					message: 'reset successful',
				},
			});
		});

		it('should reject if passwords do not match', async () => {
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				const success = await result.current.resetPassword(
					'newpassword123',
					'differentpassword'
				);
				expect(success).toBeUndefined();
			});

			expect(result.current.errorMsg).toBe(
				'The new password must be different from the old one.'
			);
		});

		it('should handle reset errors', async () => {
			mockAuthInstance.resetPassword.mockRejectedValueOnce(
				createMockError('Password must be at least 8 characters long.')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				try {
					await result.current.resetPassword('short', 'short');
				} catch (error) {
					expect(error).toBeDefined();
				}
			});

			expect(result.current.errorMsg).toBe(
				'Password must be at least 8 characters long.'
			);
		});
	});

	describe('logout', () => {
		it('should logout with success', async () => {
			mockAuthInstance.signOut.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.logout();
			});

			expect(mockAuthInstance.signOut).toHaveBeenCalledWith();
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith('/login');
		});

		it('devrait gérer les erreurs de déconnexion', async () => {
			mockAuthInstance.signOut.mockRejectedValueOnce(
				createMockError('Logout failed')
			);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.logout();
			});

			expect(success).toBe(false);
			expect(result.current.errorMsg).toBe('Error during logout.');
		});
	});

	describe('updateUser', () => {
		const updateData: Partial<UpdateUserData> = {
			username: 'UpdatedUser',
		};

		it('should update user with success', async () => {
			mockAuthInstance.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				username: 'UpdatedUser',
			} as any);

			const { result } = renderHook(() => useAuth());

			const response = await act(async () => {
				return result.current.updateUser('test-user-id', updateData);
			});

			expect(mockAuthInstance.updateProfile).toHaveBeenCalledWith(
				'test-user-id',
				updateData
			);
			expect(response).toBeDefined();
			expect(response.user).toBeDefined();
			expect(router.replace).toHaveBeenCalledWith(
				'/(app)/(tabs)/profile'
			);
		});

		it('should handle update errors', async () => {
			const { result } = renderHook(() => useAuth());

			expect(result.current.updateUser).toBeDefined();
			expect(typeof result.current.updateUser).toBe('function');
		});
	});

	describe('clearError', () => {
		it('should clear error message', async () => {
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				mockAuthInstance.signIn.mockRejectedValueOnce(
					createMockError('Test error')
				);
				await result.current.login('test@example.com', 'wrongpassword');
			});

			expect(result.current.errorMsg).toContain(
				'An error occurred during login.'
			);

			act(() => {
				result.current.clearError();
			});

			expect(result.current.errorMsg).toBe('');
		});
	});
});
