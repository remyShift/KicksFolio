import { vi } from 'vitest';

import { Auth, AuthProviderInterface } from '@/domain/Auth';

import { mockSupabaseUser } from './authSetup';

describe('Auth', () => {
	let mockAuthProvider: AuthProviderInterface;
	let auth: Auth;

	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});

		mockAuthProvider = {
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
			signInWithApple: vi.fn(),
			signInWithGoogle: vi.fn(),
		};

		auth = new Auth(mockAuthProvider);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('signUp', () => {
		it('should sign up and return the response', async () => {
			const email = 'test@example.com';
			const password = 'password123';
			const userData = mockSupabaseUser;
			const expectedResponse = { user: mockSupabaseUser, session: null };

			(mockAuthProvider.signUp as any).mockResolvedValue(
				expectedResponse
			);

			const result = await auth.signUp(email, password, userData);

			expect(mockAuthProvider.signUp).toHaveBeenCalledWith(
				email,
				password,
				userData
			);
			expect(result).toEqual(expectedResponse);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Sign up failed');
			(mockAuthProvider.signUp as any).mockRejectedValue(error);

			await expect(
				auth.signUp('test@example.com', 'password123', mockSupabaseUser)
			).rejects.toThrow('Sign up failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.signUp: Error occurred:',
				error
			);
		});
	});

	describe('signIn', () => {
		it('should sign in and return the user', async () => {
			const email = 'test@example.com';
			const password = 'password123';
			const expectedUser = { id: 'test-user-id', email };

			(mockAuthProvider.signIn as any).mockResolvedValue({
				user: expectedUser,
				session: {},
			});

			const result = await auth.signIn(email, password);

			expect(mockAuthProvider.signIn).toHaveBeenCalledWith(
				email,
				password
			);
			expect(result).toEqual(expectedUser);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Invalid credentials');
			(mockAuthProvider.signIn as any).mockRejectedValue(error);

			await expect(
				auth.signIn('test@example.com', 'wrongpassword')
			).rejects.toThrow('Invalid credentials');

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.signIn: Error occurred:',
				error
			);
		});
	});

	describe('signOut', () => {
		it('should sign out and return true', async () => {
			(mockAuthProvider.signOut as any).mockResolvedValue(undefined);

			const result = await auth.signOut();

			expect(mockAuthProvider.signOut).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Sign out failed');
			(mockAuthProvider.signOut as any).mockRejectedValue(error);

			await expect(auth.signOut()).rejects.toThrow('Sign out failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.signOut: Error occurred:',
				error
			);
		});
	});

	describe('getCurrentUser', () => {
		it('should return the current user', async () => {
			const expectedUser = {
				id: 'test-user-id',
				followers_count: 5,
				following_count: 10,
			};

			(mockAuthProvider.getCurrentUser as any).mockResolvedValue(
				expectedUser
			);

			const result = await auth.getCurrentUser();

			expect(mockAuthProvider.getCurrentUser).toHaveBeenCalled();
			expect(result.id).toBe('test-user-id');
			expect(result.followers_count).toBe(5);
			expect(result.following_count).toBe(10);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('User not found');
			(mockAuthProvider.getCurrentUser as any).mockRejectedValue(error);

			await expect(auth.getCurrentUser()).rejects.toThrow(
				'User not found'
			);

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.getCurrentUser: Error occurred:',
				error
			);
		});
	});

	describe('updateProfile', () => {
		it('should update the profile with success', async () => {
			const userId = 'test-user-id';
			const userData = { first_name: 'Updated' };
			const expectedResult = { id: userId, first_name: 'Updated' };

			(mockAuthProvider.updateProfile as any).mockResolvedValue(
				expectedResult
			);

			const result = await auth.updateProfile(userId, userData);

			expect(mockAuthProvider.updateProfile).toHaveBeenCalledWith(
				userId,
				userData
			);
			expect(result.first_name).toBe('Updated');
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Update failed');
			(mockAuthProvider.updateProfile as any).mockRejectedValue(error);

			await expect(
				auth.updateProfile('test-user-id', { first_name: 'Updated' })
			).rejects.toThrow('Update failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.updateProfile: Error occurred:',
				error
			);
		});
	});

	describe('deleteUser', () => {
		it('should delete the user with success', async () => {
			const userId = 'test-user-id';
			(mockAuthProvider.deleteUser as any).mockResolvedValue(true);

			const result = await auth.deleteUser(userId);

			expect(mockAuthProvider.deleteUser).toHaveBeenCalledWith(userId);
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Delete failed');
			(mockAuthProvider.deleteUser as any).mockRejectedValue(error);

			await expect(auth.deleteUser('test-user-id')).rejects.toThrow(
				'Delete failed'
			);

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.deleteUser: Error occurred:',
				error
			);
		});
	});

	describe('forgotPassword', () => {
		it('should send the reset password email with success', async () => {
			const email = 'test@example.com';
			(mockAuthProvider.forgotPassword as any).mockResolvedValue(
				undefined
			);

			const result = await auth.forgotPassword(email);

			expect(mockAuthProvider.forgotPassword).toHaveBeenCalledWith(email);
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Email not found');
			(mockAuthProvider.forgotPassword as any).mockRejectedValue(error);

			await expect(
				auth.forgotPassword('test@example.com')
			).rejects.toThrow('Email not found');

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.forgotPassword: Error occurred:',
				error
			);
		});
	});

	describe('resetPassword', () => {
		it('should reset the password with success', async () => {
			const newPassword = 'newpassword123';
			const expectedResult = { user: { id: 'test-user-id' } };
			(mockAuthProvider.resetPassword as any).mockResolvedValue(
				expectedResult
			);

			const result = await auth.resetPassword(newPassword);

			expect(mockAuthProvider.resetPassword).toHaveBeenCalledWith(
				newPassword
			);
			expect(result.user).toBeDefined();
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Password reset failed');
			(mockAuthProvider.resetPassword as any).mockRejectedValue(error);

			await expect(auth.resetPassword('newpassword123')).rejects.toThrow(
				'Password reset failed'
			);

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.resetPassword: Error occurred:',
				error
			);
		});
	});

	describe('resetPasswordWithTokens', () => {
		it('should reset the password with tokens with success', async () => {
			const accessToken = 'access-token';
			const refreshToken = 'refresh-token';
			const newPassword = 'newpassword123';
			(mockAuthProvider.resetPasswordWithTokens as any).mockResolvedValue(
				true
			);

			const result = await auth.resetPasswordWithTokens(
				accessToken,
				refreshToken,
				newPassword
			);

			expect(
				mockAuthProvider.resetPasswordWithTokens
			).toHaveBeenCalledWith(accessToken, refreshToken, newPassword);
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Token reset failed');
			(mockAuthProvider.resetPasswordWithTokens as any).mockRejectedValue(
				error
			);

			await expect(
				auth.resetPasswordWithTokens(
					'access-token',
					'refresh-token',
					'newpassword123'
				)
			).rejects.toThrow('Token reset failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.resetPasswordWithTokens: Error occurred:',
				error
			);
		});
	});

	describe('cleanupOrphanedSessions', () => {
		it('should clean up orphaned sessions with success', async () => {
			(mockAuthProvider.cleanupOrphanedSessions as any).mockResolvedValue(
				undefined
			);

			const result = await auth.cleanupOrphanedSessions();

			expect(mockAuthProvider.cleanupOrphanedSessions).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const error = new Error('Cleanup failed');
			(mockAuthProvider.cleanupOrphanedSessions as any).mockRejectedValue(
				error
			);

			await expect(auth.cleanupOrphanedSessions()).rejects.toThrow(
				'Cleanup failed'
			);

			expect(console.error).toHaveBeenCalledWith(
				'❌ Auth.cleanupOrphanedSessions: Error occurred:',
				error
			);
		});
	});
});
