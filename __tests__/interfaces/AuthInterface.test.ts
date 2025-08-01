jest.unmock('@/interfaces/AuthInterface');

import { AuthInterface } from '@/interfaces/AuthInterface';

describe('AuthInterface', () => {
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const testUserData = {
		id: 'test-user-id',
		email: 'test@example.com',
		username: 'testuser',
		first_name: 'Test',
		last_name: 'User',
		sneaker_size: 10,
		profile_picture: 'https://example.com/profile.jpg',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		instagram_username: 'testuser_insta',
		social_media_visibility: true,
	};

	describe('signUp', () => {
		it('should call the provider function and return the response', async () => {
			const email = 'test@example.com';
			const password = 'password123';

			const mockSignUp = jest.fn().mockResolvedValue({
				user: {
					id: 'test-user-id',
					email,
					username: testUserData.username,
					first_name: testUserData.first_name,
					last_name: testUserData.last_name,
					sneaker_size: testUserData.sneaker_size,
					profile_picture: testUserData.profile_picture,
					created_at: testUserData.created_at,
					updated_at: testUserData.updated_at,
				},
				session: {
					access_token: 'mock-access-token',
					refresh_token: 'mock-refresh-token',
					expires_in: 3600,
					token_type: 'bearer',
					user: {
						id: 'test-user-id',
						email,
						aud: 'authenticated',
						app_metadata: {},
						user_metadata: {},
						created_at: testUserData.created_at,
						email_confirmed_at: testUserData.created_at,
					},
				},
			});

			const result = await AuthInterface.signUp(
				email,
				password,
				testUserData,
				mockSignUp
			);

			expect(mockSignUp).toHaveBeenCalledWith(
				email,
				password,
				testUserData
			);

			expect(result.user).toBeDefined();
			expect(result.session).toBeDefined();
			expect(result.user.email).toBe(email);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'Sign up failed';
			const mockSignUp = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.signUp(
					'test@example.com',
					'password123',
					testUserData,
					mockSignUp
				)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.signUp: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('signIn', () => {
		it('should call the provider function and return the user', async () => {
			const email = 'test@example.com';
			const password = 'password123';

			const mockSignIn = jest.fn().mockResolvedValue({
				user: {
					id: 'test-user-id',
					email,
					aud: 'authenticated',
					app_metadata: {},
					user_metadata: {},
					created_at: testUserData.created_at,
					email_confirmed_at: testUserData.created_at,
				},
				session: {
					access_token: 'mock-access-token',
					refresh_token: 'mock-refresh-token',
					expires_in: 3600,
					token_type: 'bearer',
					user: {
						id: 'test-user-id',
						email,
						aud: 'authenticated',
						app_metadata: {},
						user_metadata: {},
						created_at: testUserData.created_at,
						email_confirmed_at: testUserData.created_at,
					},
				},
			});

			const result = await AuthInterface.signIn(
				email,
				password,
				mockSignIn
			);

			expect(mockSignIn).toHaveBeenCalledWith(email, password);

			expect(result).toBeDefined();
			expect(result.id).toBe('test-user-id');
			expect(result.email).toBe(email);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'Invalid credentials';
			const mockSignIn = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.signIn(
					'test@example.com',
					'wrongpassword',
					mockSignIn
				)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.signIn: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('signOut', () => {
		it('should call the provider function and return true', async () => {
			const mockSignOut = jest.fn().mockResolvedValue(undefined);

			const result = await AuthInterface.signOut(mockSignOut);

			expect(mockSignOut).toHaveBeenCalled();

			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'Sign out failed';
			const mockSignOut = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(AuthInterface.signOut(mockSignOut)).rejects.toThrow(
				errorMessage
			);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.signOut: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('getCurrentUser', () => {
		it('should call the provider function and return the current user', async () => {
			const mockGetCurrentUser = jest.fn().mockResolvedValue({
				id: 'test-user-id',
				email: 'test@example.com',
				username: 'testuser',
				first_name: 'Test',
				last_name: 'User',
				sneaker_size: 10,
				profile_picture: 'https://example.com/profile.jpg',
				created_at: testUserData.created_at,
				updated_at: testUserData.updated_at,
				followers_count: 5,
				following_count: 10,
			});

			const result = await AuthInterface.getCurrentUser(
				mockGetCurrentUser
			);

			expect(mockGetCurrentUser).toHaveBeenCalled();

			expect(result.id).toBe('test-user-id');
			expect(result.followers_count).toBe(5);
			expect(result.following_count).toBe(10);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'User not found';
			const mockGetCurrentUser = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.getCurrentUser(mockGetCurrentUser)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.getCurrentUser: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('updateProfile', () => {
		it('should call the provider function and update the profile with success', async () => {
			const userId = 'test-user-id';
			const userData = { first_name: 'Updated' };

			const mockUpdateProfile = jest.fn().mockResolvedValue({
				id: userId,
				email: 'test@example.com',
				username: 'testuser',
				first_name: 'Updated',
				last_name: 'User',
				sneaker_size: 10,
				profile_picture: 'https://example.com/updated-profile.jpg',
				created_at: testUserData.created_at,
				updated_at: testUserData.updated_at,
				profile_picture_url: 'https://example.com/updated-profile.jpg',
			});

			const result = await AuthInterface.updateProfile(
				userId,
				userData,
				mockUpdateProfile
			);

			expect(mockUpdateProfile).toHaveBeenCalledWith(userId, userData);

			expect(result.first_name).toBe('Updated');
			expect(result.id).toBe(userId);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'Update failed';
			const mockUpdateProfile = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.updateProfile(
					'test-user-id',
					{ first_name: 'Updated' },
					mockUpdateProfile
				)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.updateProfile: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('deleteUser', () => {
		it('should call the provider function and delete the user with success', async () => {
			const userId = 'test-user-id';
			const mockDeleteUser = jest.fn().mockResolvedValue(true);

			const result = await AuthInterface.deleteUser(
				userId,
				mockDeleteUser
			);

			expect(mockDeleteUser).toHaveBeenCalledWith(userId);

			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'Delete failed';
			const mockDeleteUser = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.deleteUser('test-user-id', mockDeleteUser)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.deleteUser: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('forgotPassword', () => {
		it('should call the provider function and send the reset password email with success', async () => {
			const email = 'test@example.com';
			const mockForgotPassword = jest.fn().mockResolvedValue(undefined);

			const result = await AuthInterface.forgotPassword(
				email,
				mockForgotPassword
			);

			expect(mockForgotPassword).toHaveBeenCalledWith(email);

			expect(result).toBe(true);
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'Email not found';
			const mockForgotPassword = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.forgotPassword(
					'test@example.com',
					mockForgotPassword
				)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.forgotPassword: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('resetPassword', () => {
		it('should call the provider function and reset the password with success', async () => {
			const newPassword = 'newpassword123';
			const mockResetPassword = jest.fn().mockResolvedValue({
				user: {
					id: 'test-user-id',
					email: 'test@example.com',
					aud: 'authenticated',
					app_metadata: {},
					user_metadata: {},
					created_at: testUserData.created_at,
					email_confirmed_at: testUserData.created_at,
				},
			});

			const result = await AuthInterface.resetPassword(
				newPassword,
				mockResetPassword
			);

			expect(mockResetPassword).toHaveBeenCalledWith(newPassword);

			expect(result.user).toBeDefined();
			expect(result.user.id).toBe('test-user-id');
		});

		it('should log the error and rethrow in case of failure', async () => {
			const errorMessage = 'Password reset failed';
			const mockResetPassword = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.resetPassword('newpassword123', mockResetPassword)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.resetPassword: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('resetPasswordWithTokens', () => {
		it('should call the provider function and reset the password with tokens with success', async () => {
			const accessToken = 'access-token';
			const refreshToken = 'refresh-token';
			const newPassword = 'newpassword123';
			const mockResetPasswordWithTokens = jest
				.fn()
				.mockResolvedValue(true);

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
			const errorMessage = 'Token reset failed';
			const mockResetPasswordWithTokens = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.resetPasswordWithTokens(
					'access-token',
					'refresh-token',
					'newpassword123',
					mockResetPasswordWithTokens
				)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.resetPasswordWithTokens: Error occurred:',
				expect.any(Error)
			);
		});
	});

	describe('cleanupOrphanedSessions', () => {
		it('should call the provider function and clean up orphaned sessions with success', async () => {
			const mockCleanupOrphanedSessions = jest
				.fn()
				.mockResolvedValue(undefined);

			const result = await AuthInterface.cleanupOrphanedSessions(
				mockCleanupOrphanedSessions
			);

			expect(mockCleanupOrphanedSessions).toHaveBeenCalled();

			expect(result).toBe(true);
		});

		it("devrait logger l'erreur et la relancer en cas d'échec", async () => {
			const errorMessage = 'Cleanup failed';
			const mockCleanupOrphanedSessions = jest
				.fn()
				.mockRejectedValue(new Error(errorMessage));

			await expect(
				AuthInterface.cleanupOrphanedSessions(
					mockCleanupOrphanedSessions
				)
			).rejects.toThrow(errorMessage);

			expect(consoleSpy).toHaveBeenCalledWith(
				'❌ AuthInterface.cleanupOrphanedSessions: Error occurred:',
				expect.any(Error)
			);
		});
	});
});
