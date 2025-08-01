// Désactiver le mock global d'AuthInterface pour ce test
jest.unmock('@/interfaces/AuthInterface');

// Importer la vraie AuthInterface
import { AuthInterface } from '@/interfaces/AuthInterface';
import {
	mockSupabaseUser,
	createSuccessfulSignUp,
	createFailingMockFunction,
	createSuccessfulSignIn,
	createSuccessfulSignOut,
	createSuccessfulGetCurrentUser,
	createSuccessfulUpdateProfile,
	createSuccessfulDeleteUser,
	createSuccessfulForgotPassword,
	createSuccessfulResetPassword,
	createSuccessfulResetPasswordWithTokens,
	createSuccessfulCleanupOrphanedSessions,
} from './authInterfaceSetup';

describe('AuthInterface', () => {
	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('signUp', () => {
		it('should sign up and return the response', async () => {
			const email = 'test@example.com';
			const password = 'password123';
			const userData = mockSupabaseUser;
			const mockSignUp = createSuccessfulSignUp();

			const result = await AuthInterface.signUp(
				email,
				password,
				userData,
				mockSignUp
			);

			expect(mockSignUp).toHaveBeenCalledWith(email, password, userData);
			expect(result.user).toBeDefined();
			expect(result.session).toBeDefined();
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockSignUp = createFailingMockFunction('Sign up failed');

			await expect(
				AuthInterface.signUp(
					'test@example.com',
					'password123',
					mockSupabaseUser,
					mockSignUp
				)
			).rejects.toThrow('Sign up failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.signUp: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('signIn', () => {
		it('should sign in and return the user', async () => {
			const email = 'test@example.com';
			const password = 'password123';
			const mockSignIn = createSuccessfulSignIn();

			const result = await AuthInterface.signIn(
				email,
				password,
				mockSignIn
			);

			expect(mockSignIn).toHaveBeenCalledWith(email, password);
			expect(result).toBeDefined();
			expect(result.id).toBe('test-user-id');
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockSignIn = createFailingMockFunction('Invalid credentials');

			await expect(
				AuthInterface.signIn(
					'test@example.com',
					'wrongpassword',
					mockSignIn
				)
			).rejects.toThrow('Invalid credentials');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.signIn: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('signOut', () => {
		it('should sign out and return true', async () => {
			const mockSignOut = createSuccessfulSignOut();

			const result = await AuthInterface.signOut(mockSignOut);

			expect(mockSignOut).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockSignOut = createFailingMockFunction('Sign out failed');

			await expect(AuthInterface.signOut(mockSignOut)).rejects.toThrow(
				'Sign out failed'
			);

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.signOut: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('getCurrentUser', () => {
		it('should return the current user', async () => {
			const mockGetCurrentUser = createSuccessfulGetCurrentUser();

			const result = await AuthInterface.getCurrentUser(
				mockGetCurrentUser
			);

			expect(mockGetCurrentUser).toHaveBeenCalled();
			expect(result.id).toBe('test-user-id');
			expect(result.followers_count).toBe(5);
			expect(result.following_count).toBe(10);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockGetCurrentUser =
				createFailingMockFunction('User not found');

			await expect(
				AuthInterface.getCurrentUser(mockGetCurrentUser)
			).rejects.toThrow('User not found');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.getCurrentUser: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('updateProfile', () => {
		it('should update the profile with success', async () => {
			const userId = 'test-user-id';
			const userData = { first_name: 'Updated' };
			const mockUpdateProfile = createSuccessfulUpdateProfile();

			const result = await AuthInterface.updateProfile(
				userId,
				userData,
				mockUpdateProfile
			);

			expect(mockUpdateProfile).toHaveBeenCalledWith(userId, userData);
			expect(result.first_name).toBe('Updated');
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockUpdateProfile =
				createFailingMockFunction('Update failed');

			await expect(
				AuthInterface.updateProfile(
					'test-user-id',
					{ first_name: 'Updated' },
					mockUpdateProfile
				)
			).rejects.toThrow('Update failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.updateProfile: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('deleteUser', () => {
		it('should delete the user with success', async () => {
			const userId = 'test-user-id';
			const mockDeleteUser = createSuccessfulDeleteUser();

			const result = await AuthInterface.deleteUser(
				userId,
				mockDeleteUser
			);

			expect(mockDeleteUser).toHaveBeenCalledWith(userId);
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockDeleteUser = createFailingMockFunction('Delete failed');

			await expect(
				AuthInterface.deleteUser('test-user-id', mockDeleteUser)
			).rejects.toThrow('Delete failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.deleteUser: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('forgotPassword', () => {
		it('should send the reset password email with success', async () => {
			const email = 'test@example.com';
			const mockForgotPassword = createSuccessfulForgotPassword();

			const result = await AuthInterface.forgotPassword(
				email,
				mockForgotPassword
			);

			expect(mockForgotPassword).toHaveBeenCalledWith(email);
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockForgotPassword =
				createFailingMockFunction('Email not found');

			await expect(
				AuthInterface.forgotPassword(
					'test@example.com',
					mockForgotPassword
				)
			).rejects.toThrow('Email not found');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.forgotPassword: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('resetPassword', () => {
		it('should reset the password with success', async () => {
			const newPassword = 'newpassword123';
			const mockResetPassword = createSuccessfulResetPassword();

			const result = await AuthInterface.resetPassword(
				newPassword,
				mockResetPassword
			);

			expect(mockResetPassword).toHaveBeenCalledWith(newPassword);
			expect(result.user).toBeDefined();
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockResetPassword = createFailingMockFunction(
				'Password reset failed'
			);

			await expect(
				AuthInterface.resetPassword('newpassword123', mockResetPassword)
			).rejects.toThrow('Password reset failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.resetPassword: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('resetPasswordWithTokens', () => {
		it('should reset the password with tokens with success', async () => {
			const accessToken = 'access-token';
			const refreshToken = 'refresh-token';
			const newPassword = 'newpassword123';
			const mockResetPasswordWithTokens =
				createSuccessfulResetPasswordWithTokens();

			const result = await AuthInterface.resetPasswordWithTokens(
				accessToken,
				refreshToken,
				newPassword,
				mockResetPasswordWithTokens
			);

			expect(mockResetPasswordWithTokens).toHaveBeenCalledWith(
				accessToken,
				refreshToken,
				newPassword
			);
			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const mockResetPasswordWithTokens =
				createFailingMockFunction('Token reset failed');

			await expect(
				AuthInterface.resetPasswordWithTokens(
					'access-token',
					'refresh-token',
					'newpassword123',
					mockResetPasswordWithTokens
				)
			).rejects.toThrow('Token reset failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.resetPasswordWithTokens: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('cleanupOrphanedSessions', () => {
		it('should clean up orphaned sessions with success', async () => {
			const mockCleanupOrphanedSessions =
				createSuccessfulCleanupOrphanedSessions();

			const result = await AuthInterface.cleanupOrphanedSessions(
				mockCleanupOrphanedSessions
			);

			expect(mockCleanupOrphanedSessions).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it("devrait logger l'erreur et la relancer en cas d'échec", async () => {
			const mockCleanupOrphanedSessions =
				createFailingMockFunction('Cleanup failed');

			await expect(
				AuthInterface.cleanupOrphanedSessions(
					mockCleanupOrphanedSessions
				)
			).rejects.toThrow('Cleanup failed');

			expect(console.error).toHaveBeenCalledWith(
				'❌ AuthInterface.cleanupOrphanedSessions: Error occurred:',
				expect.any(Error)
			);
		});
	});
});
