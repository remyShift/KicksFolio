import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { act } from 'react';
import { router } from 'expo-router';
import { UserData, UpdateUserData } from '@/types/auth';
import {
	createMockError 
} from '../interfaces/authInterfaceSetup';

vi.mock('@/context/authContext', () => ({
	useSession: () => ({
		setUser: vi.fn(),
		refreshUserData: vi.fn(),
		clearUserData: vi.fn(),
		resetTokens: null,
	}),
}));

vi.mock('@/hooks/useSignUpValidation', () => ({
	useSignUpValidation: () => ({
		validateSignUpStep1Async: vi.fn().mockResolvedValue({
			isValid: true,
			errorMsg: '',
		}),
	}),
}));

vi.mock('@/domain/ImageProvider', () => ({
	ImageProvider: {
		uploadProfileImage: vi.fn().mockResolvedValue({
			success: true,
			url: 'https://example.com/uploaded-image.jpg',
		}),
		extractFilePathFromUrl: vi.fn().mockReturnValue('old-file-path'),
		deleteImage: vi.fn().mockResolvedValue(true),
		deleteAllUserFiles: vi.fn().mockResolvedValue(true),
	},
}));

vi.mock('@/domain/AuthProvider', () => ({
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

const { authProvider: MockedAuthProvider } = await vi.importMock('@/domain/AuthProvider') as {
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

describe('useAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();

        Object.values(MockedAuthProvider).forEach(mock => {
			if (vi.isMockFunction(mock)) {
				mock.mockClear();
			}
		});

		MockedAuthProvider.signIn.mockResolvedValue({
			user: { id: 'test-user-id', email: 'test@example.com' },
			session: { access_token: 'mock-token' }
		});

		MockedAuthProvider.signUp.mockResolvedValue({
			user: { id: 'test-user-id' },
			session: { access_token: 'mock-token' }
		});

		MockedAuthProvider.signOut.mockResolvedValue(undefined);

		MockedAuthProvider.getCurrentUser.mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
			followers_count: 5,
			following_count: 10
		});

		MockedAuthProvider.updateProfile.mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
			first_name: 'Updated'
		});

		MockedAuthProvider.deleteUser.mockResolvedValue(true);
		MockedAuthProvider.forgotPassword.mockResolvedValue(undefined);
		MockedAuthProvider.resetPassword.mockResolvedValue({
			user: { id: 'test-user-id', email: 'test@example.com' }
		});
		MockedAuthProvider.resetPasswordWithTokens.mockResolvedValue(true);
		MockedAuthProvider.cleanupOrphanedSessions.mockResolvedValue(undefined);
	});

	describe('login', () => {
		it('should login with success', async () => {
			const { result } = renderHook(() => useAuth());
			
			const user = await act(async () => {
				return result.current.login('test@example.com', 'password123');
			});

			expect(MockedAuthProvider.signIn).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
			expect(user).toBeDefined();
		});

		it('should handle login errors', async () => {
			MockedAuthProvider.signIn.mockRejectedValueOnce(
				createMockError('Invalid credentials')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.login('test@example.com', 'wrongpassword');
			});

			expect(result.current.errorMsg).toContain('An error occurred during login.');
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
			const userDataWithoutPhoto = { ...userData, profile_picture: '' };
			
			MockedAuthProvider.signUp.mockResolvedValueOnce({
				user: { id: 'test-user-id' },
				session: {} as any,
			});

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userDataWithoutPhoto);
			});

			expect(MockedAuthProvider.signUp).toHaveBeenCalledWith(
				'test@example.com',
				'password123',
				expect.objectContaining({
					username: 'testuser',
					first_name: 'Test',
					last_name: 'User',
					sneaker_size: 10,
				})
			);
			expect(success).toBe(true);
		});

		it('should sign up with success with profile picture', async () => {
			MockedAuthProvider.signUp.mockResolvedValueOnce({
				user: { id: 'test-user-id' },
				session: {} as any,
			});

			MockedAuthProvider.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				profile_picture: 'https://example.com/uploaded-image.jpg',
			} as any);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userData);
			});

					expect(success).toBe(true);
		const { ImageProvider } = await vi.importMock('@/domain/ImageProvider') as {
			ImageProvider: {
				uploadProfileImage: ReturnType<typeof vi.fn>;
			};
		};
		expect(ImageProvider.uploadProfileImage)
			.toHaveBeenCalledWith('file://local-image.jpg', 'test-user-id');
		});

		it('should handle sign up errors', async () => {
			MockedAuthProvider.signUp.mockRejectedValueOnce(
				createMockError('Email already exists')
			);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userData);
			});

			expect(success).toBe(false);
			expect(result.current.errorMsg).toContain('An error occurred during sign up.');
		});
	});

	describe('forgotPassword', () => {
		it('should send reset email with success', async () => {
			MockedAuthProvider.forgotPassword.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.forgotPassword('test@example.com');
			});

			expect(MockedAuthProvider.forgotPassword).toHaveBeenCalledWith(
				'test@example.com'
			);
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith({
				pathname: '/login',
				params: { message: 'email sent' },
			});
		});

		it('should handle email sending errors', async () => {
			MockedAuthProvider.forgotPassword.mockRejectedValueOnce(
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
			MockedAuthProvider.resetPassword.mockResolvedValueOnce({
				user: { id: 'test-user-id' } as any,
			});

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.resetPassword('newpassword123', 'newpassword123');
			});

			expect(MockedAuthProvider.resetPassword).toHaveBeenCalledWith(
				'newpassword123'
			);
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith({
				pathname: '/login',
				params: { message: 'reset successful' },
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

			expect(result.current.errorMsg).toBe('The new password must be different from the old one.');
		});

		it('should handle reset errors', async () => {
			MockedAuthProvider.resetPassword.mockRejectedValueOnce(
				createMockError('Password should be at least 8 characters')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				try {
					await result.current.resetPassword('short', 'short');
				} catch (error) {
					expect(error).toBeDefined();
				}
			});

			expect(result.current.errorMsg).toBe('Password must be at least 8 characters long.');
		});
	});

	describe('logout', () => {
		it('should logout with success', async () => {
			MockedAuthProvider.signOut.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.logout();
			});

			expect(MockedAuthProvider.signOut).toHaveBeenCalled();
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith('/login');
		});

		it('devrait gérer les erreurs de déconnexion', async () => {
			MockedAuthProvider.signOut.mockRejectedValueOnce(
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

			const { result } = renderHook(() => useAuth());

			const response = await act(async () => {
				return result.current.updateUser('test-user-id', updateData);
			});

			expect(MockedAuthProvider.updateProfile).toHaveBeenCalledWith(
				'test-user-id',
				updateData
			);
			expect(response.user.first_name).toBe('Updated');
			expect(router.replace).toHaveBeenCalledWith('/(app)/(tabs)/profile');
		});

		it('should handle update errors', async () => {
			MockedAuthProvider.updateProfile.mockRejectedValueOnce(
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
				MockedAuthProvider.signIn.mockRejectedValueOnce(
					createMockError('Test error')
				);
				await result.current.login('test@example.com', 'wrongpassword');
			});

		expect(result.current.errorMsg).toContain('An error occurred during login.');

		act(() => {
			result.current.clearError();
		});

		expect(result.current.errorMsg).toBe('');
		});
	});
});