import { AuthService } from '@/services/AuthService';
import { FormValidationService } from '@/services/FormValidationService';
import { UserData } from '@/types/Auth';
import { User } from '@/types/User';

// Mock du FormValidationService
const mockFormValidationService = {
	validateField: jest.fn(),
	validateConfirmPassword: jest.fn(),
	setErrorMessage: jest.fn(),
	clearErrors: jest.fn(),
} as unknown as jest.Mocked<FormValidationService>;

// Mock des données utilisateur
const mockUserData: UserData = {
	email: 'test@example.com',
	password: 'Password123',
	username: 'testuser',
	first_name: 'John',
	last_name: 'Doe',
	sneaker_size: 42,
	profile_picture: 'test-image.jpg',
	confirmPassword: 'Password123',
};

const mockUser: User = {
	id: '1',
	email: 'test@example.com',
	password: 'Password123',
	username: 'testuser',
	first_name: 'John',
	last_name: 'Doe',
	sneaker_size: 42,
	profile_picture: {
		id: '1',
		url: 'test-image.jpg',
	},
	profile_picture_url: 'test-image.jpg',
	created_at: '2024-01-01',
	updated_at: '2024-01-01',
	friends: [],
	collection: {
		id: '1',
		name: 'My Collection',
		user_id: '1',
		created_at: '2024-01-01',
		updated_at: '2024-01-01',
	},
	sneakers: [],
};

const mockTokens = {
	access: 'fake-access-token',
	refresh: 'fake-refresh-token',
};

describe('AuthService', () => {
	let authService: AuthService;

	beforeEach(() => {
		authService = new AuthService();
		global.fetch = jest.fn();
		jest.clearAllMocks();
	});

	describe('handleLogin', () => {
		it('should return true when credentials are valid', async () => {
			(mockFormValidationService.validateField as jest.Mock)
				.mockResolvedValueOnce(true) // email validation
				.mockResolvedValueOnce(true); // password validation

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({ user: mockUser, tokens: mockTokens }),
			});

			const result = await authService.handleLogin(
				mockUserData.email,
				mockUserData.password,
				mockFormValidationService
			);

			expect(result).toBe(true);
			expect(
				mockFormValidationService.validateField
			).toHaveBeenCalledWith(mockUserData.email, 'email', undefined);
			expect(
				mockFormValidationService.validateField
			).toHaveBeenCalledWith(mockUserData.password, 'password');
		});

		it('should return false when email is invalid', async () => {
			(mockFormValidationService.validateField as jest.Mock)
				.mockResolvedValueOnce(false) // email validation fails
				.mockResolvedValueOnce(true); // password validation

			const result = await authService.handleLogin(
				'invalid-email',
				mockUserData.password,
				mockFormValidationService
			);

			expect(result).toBe(false);
		});

		it('should return false when password is invalid', async () => {
			(mockFormValidationService.validateField as jest.Mock)
				.mockResolvedValueOnce(true) // email validation
				.mockResolvedValueOnce(false); // password validation fails

			const result = await authService.handleLogin(
				mockUserData.email,
				'invalid',
				mockFormValidationService
			);

			expect(result).toBe(false);
		});

		it('should handle login API errors', async () => {
			(mockFormValidationService.validateField as jest.Mock)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(true);

			(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error')
			);

			const result = await authService.handleLogin(
				mockUserData.email,
				mockUserData.password,
				mockFormValidationService
			);

			expect(result).toBe(false);
			expect(
				mockFormValidationService.setErrorMessage
			).toHaveBeenCalledWith('Invalid email or password');
		});
	});

	describe('login', () => {
		it('should make correct API call for login', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({ user: mockUser, tokens: mockTokens }),
			});

			const result = await authService.login(
				mockUserData.email,
				mockUserData.password
			);

			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.EXPO_PUBLIC_BASE_API_URL}/login`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						authentication: {
							email: mockUserData.email,
							password: mockUserData.password,
						},
					}),
				}
			);
			expect(result).toEqual({ user: mockUser, tokens: mockTokens });
		});
	});

	describe('signUp', () => {
		it('should make correct API call for signup', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ user: mockUser }),
			});

			const result = await authService.signUp(mockUserData);

			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.EXPO_PUBLIC_BASE_API_URL}/users`,
				expect.objectContaining({
					method: 'POST',
					body: expect.any(FormData),
				})
			);
			expect(result).toEqual({ user: mockUser });
		});

		it('should handle signup with profile picture', async () => {
			const userDataWithPicture = {
				...mockUserData,
				profile_picture: 'data:image/jpeg;base64,fake-image-data',
			};

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ user: mockUser }),
			});

			await authService.signUp(userDataWithPicture);

			expect(global.fetch).toHaveBeenCalled();
		});
	});

	describe('handleSignUp', () => {
		const mockSetSignUpProps = jest.fn();

		beforeEach(() => {
			mockSetSignUpProps.mockClear();
		});

		it('should handle complete signup flow successfully', async () => {
			(global.fetch as jest.Mock)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ user: mockUser }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({ user: mockUser, tokens: mockTokens }),
				});

			const result = await authService.handleSignUp(
				mockUserData,
				mockFormValidationService,
				mockSetSignUpProps
			);

			expect(result).toBe(true);
			expect(mockSetSignUpProps).toHaveBeenCalledWith(
				expect.objectContaining({
					email: '',
					password: '',
					username: '',
					first_name: '',
					last_name: '',
					sneaker_size: '',
					profile_picture: '',
				})
			);
		});

		it('should validate required fields', async () => {
			const invalidUserData = { ...mockUserData, username: '' };

			const result = await authService.handleSignUp(
				invalidUserData,
				mockFormValidationService,
				mockSetSignUpProps
			);

			expect(result).toBe(false);
			expect(
				mockFormValidationService.setErrorMessage
			).toHaveBeenCalledWith('Please put your username.');
		});

		it('should handle signup API errors', async () => {
			(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Server error')
			);

			const result = await authService.handleSignUp(
				mockUserData,
				mockFormValidationService,
				mockSetSignUpProps
			);

			expect(result).toBe(false);
			expect(
				mockFormValidationService.setErrorMessage
			).toHaveBeenCalledWith(
				expect.stringContaining(
					'Something went wrong. Please try again.'
				)
			);
		});
	});

	describe('getUser', () => {
		it('should fetch user data with token', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ user: mockUser }),
			});

			const result = await authService.getUser('fake-token');

			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/me`,
				{
					headers: expect.objectContaining({
						Authorization: 'Bearer fake-token',
					}),
				}
			);
			expect(result).toEqual({ user: mockUser });
		});
	});

	describe('updateUser', () => {
		const updateData = {
			username: 'newusername',
			first_name: 'Jane',
			profile_picture: 'new-image.jpg',
		};

		it('should update user profile', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({ user: { ...mockUser, ...updateData } }),
			});

			const result = await authService.updateUser(
				'1',
				updateData,
				'fake-token'
			);

			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/1`,
				expect.objectContaining({
					method: 'PATCH',
					body: expect.any(FormData),
				})
			);
			expect(result.user).toMatchObject(updateData);
		});
	});

	describe('deleteAccount', () => {
		it('should delete user account', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						message: 'Account deleted successfully',
					}),
			});

			const result = await authService.deleteAccount('1', 'fake-token');

			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.EXPO_PUBLIC_BASE_API_URL}/users/1`,
				{
					method: 'DELETE',
					headers: expect.objectContaining({
						Authorization: 'Bearer fake-token',
					}),
				}
			);
			expect(result).toEqual({ message: 'Account deleted successfully' });
		});
	});

	describe('logout', () => {
		it('should logout user successfully', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

			const result = await authService.logout('fake-token');

			expect(global.fetch).toHaveBeenCalledWith(
				`${process.env.EXPO_PUBLIC_BASE_API_URL}/logout`,
				{
					method: 'DELETE',
					headers: expect.objectContaining({
						Authorization: 'Bearer fake-token',
					}),
				}
			);
			expect(result).toBe(true);
		});
	});

	describe('verifyToken', () => {
		it('should verify valid token', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ valid: true }),
			});

			const result = await authService.verifyToken('valid-token');

			expect(result).toBe(true);
		});

		it('should handle invalid token', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

			const result = await authService.verifyToken('invalid-token');

			expect(result).toBe(false);
		});
	});

	describe('handleResetPassword', () => {
		it('should reset password when valid', async () => {
			(mockFormValidationService.validateField as jest.Mock)
				.mockResolvedValueOnce(true) // password validation
				.mockResolvedValueOnce(true); // confirm password validation

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({}),
			});

			const result = await authService.handleResetPassword(
				'reset-token',
				'NewPassword123',
				'NewPassword123',
				mockFormValidationService
			);

			expect(result).toBe(true);
		});

		it('should handle password validation errors', async () => {
			(mockFormValidationService.validateField as jest.Mock)
				.mockResolvedValueOnce(false) // password validation fails
				.mockResolvedValueOnce(true);

			const result = await authService.handleResetPassword(
				'reset-token',
				'weak',
				'weak',
				mockFormValidationService
			);

			expect(result).toBe(false);
		});
	});

	describe('handleForgotPassword', () => {
		it('should send forgot password email when email is valid', async () => {
			(
				mockFormValidationService.validateField as jest.Mock
			).mockResolvedValueOnce(true);

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({}),
			});

			const result = await authService.handleForgotPassword(
				mockUserData.email,
				mockFormValidationService
			);

			expect(result).toBe(true);
		});

		it('should handle invalid email', async () => {
			(
				mockFormValidationService.validateField as jest.Mock
			).mockResolvedValueOnce(false);

			const result = await authService.handleForgotPassword(
				'invalid-email',
				mockFormValidationService
			);

			expect(result).toBe(false);
		});
	});
});
