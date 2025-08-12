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

vi.mock('@/domain/ImageProxy', () => ({
	ImageProxy: {
		uploadProfileImage: vi.fn().mockResolvedValue({
			success: true,
			url: 'https://example.com/uploaded-image.jpg',
		}),
		extractFilePathFromUrl: vi.fn().mockReturnValue('old-file-path'),
		deleteImage: vi.fn().mockResolvedValue(true),
		deleteAllUserFiles: vi.fn().mockResolvedValue(true),
	},
	imageProvider: {
		uploadProfileImage: vi.fn().mockResolvedValue({
			success: true,
			url: 'https://example.com/uploaded-image.jpg',
		}),
		extractFilePathFromUrl: vi.fn().mockReturnValue('old-file-path'),
		deleteImage: vi.fn().mockResolvedValue(true),
		deleteAllUserFiles: vi.fn().mockResolvedValue(true),
	},
}));

vi.mock('@/domain/AuthProxy', () => ({
	authProvider: {
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

vi.mock('@/interfaces/Auth', () => ({
	Auth: {
		signUp: vi.fn().mockResolvedValue({
			user: { id: 'test-user-id' },
			session: null,
		}),
		signIn: vi.fn().mockResolvedValue({
			user: { id: 'test-user-id' },
			session: {},
		}),
		updateProfile: vi.fn().mockResolvedValue({ id: 'test-user-id' }),
		getCurrentUser: vi.fn().mockResolvedValue({ id: 'test-user-id' }),
		forgotPassword: vi.fn().mockResolvedValue(undefined),
		resetPassword: vi.fn().mockResolvedValue(undefined),
		signOut: vi.fn().mockResolvedValue(undefined),
	},
}));

const { authProvider: MockedAuthProvider } = (await vi.importMock(
	'@/domain/AuthProxy'
)) as {
	authProvider: {
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

const { Auth: MockedAuthInterface } = (await vi.importMock(
	'@/interfaces/Auth'
)) as {
	Auth: {
		signUp: ReturnType<typeof vi.fn>;
		signIn: ReturnType<typeof vi.fn>;
		updateProfile: ReturnType<typeof vi.fn>;
		getCurrentUser: ReturnType<typeof vi.fn>;
		forgotPassword: ReturnType<typeof vi.fn>;
		resetPassword: ReturnType<typeof vi.fn>;
		signOut: ReturnType<typeof vi.fn>;
	};
};

describe('useAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		Object.values(MockedAuthProvider).forEach((mock) => {
			if (vi.isMockFunction(mock)) {
				mock.mockClear();
			}
		});

		Object.values(MockedAuthInterface).forEach((mock) => {
			if (vi.isMockFunction(mock)) {
				mock.mockClear();
			}
		});

		MockedAuthProvider.signIn.mockResolvedValue({
			user: {
				id: 'test-user-id',
				email: 'test@example.com',
			},
			session: { access_token: 'mock-token' },
		});

		MockedAuthProvider.signUp.mockResolvedValue({
			user: { id: 'test-user-id' },
			session: { access_token: 'mock-token' },
		});

		MockedAuthProvider.signOut.mockResolvedValue(undefined);

		MockedAuthProvider.getCurrentUser.mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
			followers_count: 5,
			following_count: 10,
		});

		MockedAuthProvider.updateProfile.mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
			first_name: 'Updated',
		});

		MockedAuthProvider.deleteUser.mockResolvedValue(true);
		MockedAuthProvider.forgotPassword.mockResolvedValue(undefined);
		MockedAuthProvider.resetPassword.mockResolvedValue({
			user: {
				id: 'test-user-id',
				email: 'test@example.com',
			},
		});
		MockedAuthProvider.resetPasswordWithTokens.mockResolvedValue(true);
		MockedAuthProvider.cleanupOrphanedSessions.mockResolvedValue(undefined);
	});

	describe('login', () => {
		it('should login with success', async () => {
			MockedAuthInterface.signIn.mockResolvedValueOnce({
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

			expect(MockedAuthInterface.signIn).toHaveBeenCalledWith(
				'test@example.com',
				'password123',
				MockedAuthProvider.signIn
			);
			expect(user).toBeDefined();
		});

		it('should handle login errors', async () => {
			MockedAuthInterface.signIn.mockRejectedValueOnce(
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
			first_name: 'Test',
			last_name: 'User',
			sneaker_size: 10,
			profile_picture: 'file://local-image.jpg',
		};

		it('should sign up with success without profile picture', async () => {
			const userDataWithoutPhoto = {
				...userData,
				profile_picture: '',
			};

			MockedAuthInterface.signUp.mockResolvedValueOnce({
				user: {
					id: 'test-user-id',
				},
				session: {} as any,
			});

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userDataWithoutPhoto);
			});

			expect(MockedAuthInterface.signUp).toHaveBeenCalledWith(
				'test@example.com',
				'password123',
				expect.objectContaining({
					username: 'testuser',
					first_name: 'Test',
					last_name: 'User',
					sneaker_size: 10,
				}),
				MockedAuthProvider.signUp
			);
			expect(success).toBe(true);
		});

		it('should sign up with success with profile picture', async () => {
			MockedAuthProvider.signUp.mockResolvedValueOnce({
				user: {
					id: 'test-user-id',
				},
				session: {} as any,
			});

			MockedAuthInterface.signUp.mockResolvedValueOnce({
				user: {
					id: 'test-user-id',
				},
				session: {} as any,
			});

			MockedAuthProvider.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				profile_picture: 'https://example.com/uploaded-image.jpg',
			} as any);

			MockedAuthInterface.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				profile_picture: 'https://example.com/uploaded-image.jpg',
			} as any);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userData);
			});

			expect(success).toBe(true);
			const { imageProvider } = (await vi.importMock(
				'@/domain/ImageProxy'
			)) as {
				imageProvider: {
					uploadProfileImage: ReturnType<typeof vi.fn>;
				};
			};
			expect(imageProvider.uploadProfileImage).toHaveBeenCalledWith(
				'file://local-image.jpg',
				'test-user-id'
			);
		});

		it('should handle sign up errors', async () => {
			MockedAuthInterface.signUp.mockRejectedValueOnce(
				createMockError('Email already exists')
			);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userData);
			});

			expect(success).toBe(false);
			expect(result.current.errorMsg).toContain(
				'An error occurred during sign up.'
			);
		});
	});

	describe('forgotPassword', () => {
		it('should send reset email with success', async () => {
			MockedAuthInterface.forgotPassword.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.forgotPassword('test@example.com');
			});

			expect(MockedAuthInterface.forgotPassword).toHaveBeenCalledWith(
				'test@example.com',
				MockedAuthProvider.forgotPassword
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
			MockedAuthInterface.forgotPassword.mockRejectedValueOnce(
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
			MockedAuthInterface.resetPassword.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.resetPassword(
					'newpassword123',
					'newpassword123'
				);
			});

			expect(MockedAuthInterface.resetPassword).toHaveBeenCalledWith(
				'newpassword123',
				MockedAuthProvider.resetPassword
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
			MockedAuthInterface.resetPassword.mockRejectedValueOnce(
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
			MockedAuthInterface.signOut.mockResolvedValueOnce(undefined);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.logout();
			});

			expect(MockedAuthInterface.signOut).toHaveBeenCalledWith(
				MockedAuthProvider.signOut
			);
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith('/login');
		});

		it('devrait gérer les erreurs de déconnexion', async () => {
			MockedAuthInterface.signOut.mockRejectedValueOnce(
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
			first_name: 'Updated',
			last_name: 'Name',
		};

		it('should update user with success', async () => {
			MockedAuthProvider.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				first_name: 'Updated',
				last_name: 'Name',
			} as any);

			MockedAuthInterface.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				first_name: 'Updated',
				last_name: 'Name',
			} as any);

			const { result } = renderHook(() => useAuth());

			const response = await act(async () => {
				return result.current.updateUser('test-user-id', updateData);
			});

			expect(MockedAuthInterface.updateProfile).toHaveBeenCalledWith(
				'test-user-id',
				updateData,
				MockedAuthProvider.updateProfile
			);
			expect(response.user.first_name).toBe('Updated');
			expect(router.replace).toHaveBeenCalledWith(
				'/(app)/(tabs)/profile'
			);
		});

		it('should handle update errors', async () => {
			MockedAuthProvider.updateProfile.mockRejectedValueOnce(
				createMockError('Update failed')
			);

			MockedAuthInterface.updateProfile.mockRejectedValueOnce(
				createMockError('Update failed')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				try {
					await result.current.updateUser('test-user-id', updateData);
				} catch (error) {
					expect(error).toBeDefined();
				}
			});

			expect(result.current.errorMsg).toBe('Error updating profile.');
		});
	});

	describe('clearError', () => {
		it('should clear error message', async () => {
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				MockedAuthInterface.signIn.mockRejectedValueOnce(
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
