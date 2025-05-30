import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/AuthService';
import { FormValidationService } from '@/services/FormValidationService';
import { useSession } from '@/hooks/useSession';
import { router } from 'expo-router';

// Mock des dépendances
jest.mock('@/services/AuthService');
jest.mock('@/services/FormValidationService');
jest.mock('@/hooks/useSession');
jest.mock('expo-router', () => ({
	router: {
		replace: jest.fn(),
	},
}));

const mockAuthService = {
	handleLogin: jest.fn(),
	handleSignUp: jest.fn(),
	handleForgotPassword: jest.fn(),
	handleResetPassword: jest.fn(),
} as unknown as jest.Mocked<AuthService>;

const mockFormValidationService = {
	validateField: jest.fn(),
	validateConfirmPassword: jest.fn(),
	setErrorMessage: jest.fn(),
	clearErrors: jest.fn(),
} as unknown as jest.Mocked<FormValidationService>;

const mockUseSession = {
	user: null,
	sessionToken: null,
	refreshToken: null,
	setUser: jest.fn(),
	setSessionToken: jest.fn(),
	setRefreshToken: jest.fn(),
	clearSession: jest.fn(),
};

describe('useAuth', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(AuthService as jest.Mock).mockImplementation(() => mockAuthService);
		(FormValidationService as jest.Mock).mockImplementation(
			() => mockFormValidationService
		);
		(useSession as jest.Mock).mockReturnValue(mockUseSession);
	});

	describe('login', () => {
		it('should handle successful login', async () => {
			mockAuthService.handleLogin.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.login('test@example.com', 'Password123');
			});

			expect(mockAuthService.handleLogin).toHaveBeenCalledWith(
				'test@example.com',
				'Password123',
				expect.any(Object)
			);
			expect(router.replace).toHaveBeenCalledWith('/(app)/(tabs)/');
		});

		it('should handle failed login', async () => {
			mockAuthService.handleLogin.mockResolvedValueOnce(false);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.login('test@example.com', 'wrongpassword');
			});

			expect(mockAuthService.handleLogin).toHaveBeenCalled();
			expect(router.replace).not.toHaveBeenCalled();
		});

		it('should handle login errors', async () => {
			mockAuthService.handleLogin.mockRejectedValueOnce(
				new Error('Network error')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.login('test@example.com', 'Password123');
			});

			expect(
				mockFormValidationService.setErrorMessage
			).toHaveBeenCalledWith(
				"Une erreur s'est produite lors de la connexion, veuillez réessayer."
			);
		});

		it('should clear errors before login attempt', async () => {
			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.login('test@example.com', 'Password123');
			});

			expect(mockFormValidationService.clearErrors).toHaveBeenCalled();
		});
	});

	describe('signUp', () => {
		const signUpData = {
			email: 'test@example.com',
			password: 'Password123',
			username: 'testuser',
			first_name: 'John',
			last_name: 'Doe',
			sneaker_size: 42,
			profile_picture: 'image.jpg',
			confirmPassword: 'Password123',
		};

		const setSignUpProps = jest.fn();

		it('should handle successful signup', async () => {
			mockAuthService.handleSignUp.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.signUp(signUpData, setSignUpProps);
			});

			expect(mockAuthService.handleSignUp).toHaveBeenCalledWith(
				signUpData,
				expect.any(Object),
				setSignUpProps
			);
			expect(router.replace).toHaveBeenCalledWith('/(app)/(tabs)/');
		});

		it('should handle failed signup', async () => {
			mockAuthService.handleSignUp.mockResolvedValueOnce(false);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.signUp(signUpData, setSignUpProps);
			});

			expect(mockAuthService.handleSignUp).toHaveBeenCalled();
			expect(router.replace).not.toHaveBeenCalled();
		});

		it('should handle signup errors', async () => {
			mockAuthService.handleSignUp.mockRejectedValueOnce(
				new Error('Validation error')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.signUp(signUpData, setSignUpProps);
			});

			expect(
				mockFormValidationService.setErrorMessage
			).toHaveBeenCalledWith(
				"Une erreur s'est produite lors de l'inscription, veuillez réessayer."
			);
		});
	});

	describe('forgotPassword', () => {
		it('should handle successful forgot password request', async () => {
			mockAuthService.handleForgotPassword.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.forgotPassword('test@example.com');
			});

			expect(mockAuthService.handleForgotPassword).toHaveBeenCalledWith(
				'test@example.com',
				expect.any(Object)
			);
			expect(router.replace).toHaveBeenCalledWith('/login');
		});

		it('should handle failed forgot password request', async () => {
			mockAuthService.handleForgotPassword.mockResolvedValueOnce(false);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.forgotPassword('invalid@example.com');
			});

			expect(mockAuthService.handleForgotPassword).toHaveBeenCalled();
			expect(router.replace).not.toHaveBeenCalled();
		});

		it('should handle forgot password errors', async () => {
			mockAuthService.handleForgotPassword.mockRejectedValueOnce(
				new Error('Server error')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.forgotPassword('test@example.com');
			});

			expect(
				mockFormValidationService.setErrorMessage
			).toHaveBeenCalledWith(
				"Une erreur s'est produite lors de l'envoi de l'email de réinitialisation, veuillez réessayer."
			);
		});
	});

	describe('resetPassword', () => {
		it('should handle successful password reset', async () => {
			mockAuthService.handleResetPassword.mockResolvedValueOnce(true);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.resetPassword(
					'reset-token',
					'NewPassword123',
					'NewPassword123'
				);
			});

			expect(mockAuthService.handleResetPassword).toHaveBeenCalledWith(
				'reset-token',
				'NewPassword123',
				'NewPassword123',
				expect.any(Object)
			);
			expect(router.replace).toHaveBeenCalledWith('/login');
		});

		it('should handle failed password reset', async () => {
			mockAuthService.handleResetPassword.mockResolvedValueOnce(false);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.resetPassword(
					'invalid-token',
					'NewPassword123',
					'NewPassword123'
				);
			});

			expect(mockAuthService.handleResetPassword).toHaveBeenCalled();
			expect(router.replace).not.toHaveBeenCalled();
		});

		it('should handle reset password errors', async () => {
			mockAuthService.handleResetPassword.mockRejectedValueOnce(
				new Error('Token expired')
			);

			const { result } = renderHook(() => useAuth());

			await act(async () => {
				await result.current.resetPassword(
					'expired-token',
					'NewPassword123',
					'NewPassword123'
				);
			});

			expect(
				mockFormValidationService.setErrorMessage
			).toHaveBeenCalledWith(
				"Une erreur s'est produite lors de la réinitialisation du mot de passe, veuillez réessayer."
			);
		});
	});

	describe('validation service initialization', () => {
		it('should initialize FormValidationService with correct parameters', () => {
			renderHook(() => useAuth());

			expect(FormValidationService).toHaveBeenCalledWith(
				expect.any(Function),
				expect.any(Object)
			);
		});

		it('should initialize AuthService', () => {
			renderHook(() => useAuth());

			expect(AuthService).toHaveBeenCalled();
		});
	});
});
