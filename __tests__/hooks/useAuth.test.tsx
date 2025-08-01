import { renderHook } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';
import { act } from 'react';
import { AuthInterface } from '@/interfaces/AuthInterface';
import { router } from 'expo-router';
import { UserData, UpdateUserData } from '@/types/auth';
import {
	createMockError 
} from '../interfaces/authInterfaceSetup';

jest.mock('@/context/authContext', () => ({
	useSession: () => ({
		setUser: jest.fn(),
		refreshUserData: jest.fn(),
		clearUserData: jest.fn(),
		resetTokens: null,
	}),
}));

jest.mock('@/hooks/useSignUpValidation', () => ({
	useSignUpValidation: () => ({
		validateSignUpStep1Async: jest.fn().mockResolvedValue({
			isValid: true,
			errorMsg: '',
		}),
	}),
}));

jest.mock('@/domain/ImageProvider', () => ({
	ImageProvider: {
		uploadProfileImage: jest.fn().mockResolvedValue({
			success: true,
			url: 'https://example.com/uploaded-image.jpg',
		}),
		extractFilePathFromUrl: jest.fn().mockReturnValue('old-file-path'),
		deleteImage: jest.fn().mockResolvedValue(true),
		deleteAllUserFiles: jest.fn().mockResolvedValue(true),
	},
}));

jest.mock('@/interfaces/AuthInterface', () => ({
	AuthInterface: {
		signIn: jest.fn(),
		signUp: jest.fn(),
		signOut: jest.fn(),
		getCurrentUser: jest.fn(),
		updateProfile: jest.fn(),
		deleteUser: jest.fn(),
		forgotPassword: jest.fn(),
		resetPassword: jest.fn(),
		resetPasswordWithTokens: jest.fn(),
	},
}));

const MockedAuthInterface = AuthInterface as jest.Mocked<typeof AuthInterface>;

describe('useAuth', () => {
	beforeEach(() => {
		jest.clearAllMocks();

        Object.values(MockedAuthInterface).forEach(mock => {
			if (jest.isMockFunction(mock)) {
				mock.mockClear();
			}
		});

		MockedAuthInterface.signIn.mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
		} as any);
	});

	describe('login', () => {
		it('devrait se connecter avec succès', async () => {
			const { result } = renderHook(() => useAuth());
			
			const user = await act(async () => {
				return result.current.login('test@example.com', 'password123');
			});

			expect(MockedAuthInterface.signIn).toHaveBeenCalledWith(
				'test@example.com',
				'password123',
				AuthInterface.signIn
			);
			expect(user).toBeDefined();
		});

		it('devrait gérer les erreurs de connexion', async () => {
			MockedAuthInterface.signIn.mockRejectedValueOnce(
				createMockError('Invalid credentials')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.login('test@example.com', 'wrongpassword');
			});

			expect(result.current.errorMsg).toContain('auth.error.login');
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

		it('devrait s\'inscrire avec succès sans photo de profil', async () => {
			const userDataWithoutPhoto = { ...userData, profile_picture: '' };
			
			MockedAuthInterface.signUp.mockResolvedValueOnce({
				user: { id: 'test-user-id' },
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
				AuthInterface.signUp
			);
			expect(success).toBe(true);
		});

		it('devrait s\'inscrire avec succès avec photo de profil', async () => {
			MockedAuthInterface.signUp.mockResolvedValueOnce({
				user: { id: 'test-user-id' },
				session: {} as any,
			});

			MockedAuthInterface.updateProfile.mockResolvedValueOnce({
				id: 'test-user-id',
				profile_picture: 'https://example.com/uploaded-image.jpg',
			} as any);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userData);
			});

			expect(success).toBe(true);
			// Vérifie que l'upload d'image a été appelé
			expect(require('@/domain/ImageProvider').ImageProvider.uploadProfileImage)
				.toHaveBeenCalledWith('file://local-image.jpg', 'test-user-id');
		});

		it('devrait gérer les erreurs d\'inscription', async () => {
			MockedAuthInterface.signUp.mockRejectedValueOnce(
				createMockError('Email already exists')
			);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.signUp(userData);
			});

			expect(success).toBe(false);
			expect(result.current.errorMsg).toContain('auth.error.signUp');
		});
	});

	describe('forgotPassword', () => {
		it('devrait envoyer l\'email de réinitialisation avec succès', async () => {
			MockedAuthInterface.forgotPassword.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.forgotPassword('test@example.com');
			});

			expect(MockedAuthInterface.forgotPassword).toHaveBeenCalledWith(
				'test@example.com',
				AuthInterface.forgotPassword
			);
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith({
				pathname: '/login',
				params: { message: 'email sent' },
			});
		});

		it('devrait gérer les erreurs d\'envoi d\'email', async () => {
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
		it('devrait réinitialiser le mot de passe avec succès', async () => {
			MockedAuthInterface.resetPassword.mockResolvedValueOnce({
				user: { id: 'test-user-id' } as any,
			});

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.resetPassword('newpassword123', 'newpassword123');
			});

			expect(MockedAuthInterface.resetPassword).toHaveBeenCalledWith(
				'newpassword123',
				AuthInterface.resetPassword
			);
			expect(success).toBe(true);
			expect(router.replace).toHaveBeenCalledWith({
				pathname: '/login',
				params: { message: 'reset successful' },
			});
		});

		it('devrait rejeter si les mots de passe ne correspondent pas', async () => {
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				const success = await result.current.resetPassword(
					'newpassword123', 
					'differentpassword'
				);
				expect(success).toBeUndefined();
			});

			expect(result.current.errorMsg).toBe('auth.error.samePasswordAsOld');
		});

		it('devrait gérer les erreurs de réinitialisation', async () => {
			MockedAuthInterface.resetPassword.mockRejectedValueOnce(
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

			expect(result.current.errorMsg).toBe('auth.form.password.error.size');
		});
	});

	describe('logout', () => {
		it('devrait se déconnecter avec succès', async () => {
			MockedAuthInterface.signOut.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			const success = await act(async () => {
				return result.current.logout();
			});

			expect(MockedAuthInterface.signOut).toHaveBeenCalledWith(
				AuthInterface.signOut
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

		it('devrait mettre à jour l\'utilisateur avec succès', async () => {
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
				AuthInterface.updateProfile
			);
			expect(response.user.first_name).toBe('Updated');
			expect(router.replace).toHaveBeenCalledWith('/(app)/(tabs)/profile');
		});

		it('devrait gérer les erreurs de mise à jour', async () => {
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
		it('devrait effacer le message d\'erreur', async () => {
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				MockedAuthInterface.signIn.mockRejectedValueOnce(
					createMockError('Test error')
				);
				await result.current.login('test@example.com', 'wrongpassword');
			});

			expect(result.current.errorMsg).toContain('auth.error.login');

			act(() => {
				result.current.clearError();
			});

			expect(result.current.errorMsg).toBe('');
		});
	});
});