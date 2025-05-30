import { FormValidationService } from '@/services/FormValidationService';
import { TextInput } from 'react-native';

const mockSetErrorMsg = jest.fn();
const mockErrorSetters = {
	username: jest.fn(),
	email: jest.fn(),
	password: jest.fn(),
	firstName: jest.fn(),
	lastName: jest.fn(),
	confirmPassword: jest.fn(),
	size: jest.fn(),
};

describe('FormValidationService', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		formValidationService = new FormValidationService(
			mockSetErrorMsg,
			mockErrorSetters
		);
		global.fetch = jest.fn();
		jest.clearAllMocks();
	});

	describe('validateField', () => {
		describe('email validation', () => {
			it('should validate correct email format', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ users: [] }),
				});

				const result = await formValidationService.validateField(
					'test@example.com',
					'email'
				);

				expect(result).toBe(true);
				expect(mockSetErrorMsg).toHaveBeenCalledWith('');
			});

			it('should reject invalid email format', async () => {
				const result = await formValidationService.validateField(
					'invalid-email',
					'email'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put a valid email.'
				);
			});

			it('should reject empty email', async () => {
				const result = await formValidationService.validateField(
					'',
					'email'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put your email.'
				);
			});

			it('should reject email that already exists', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							users: [{ email: 'test@example.com' }],
						}),
				});

				const result = await formValidationService.validateField(
					'test@example.com',
					'email'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'This email is already taken.'
				);
			});

			it('should allow existing email on login page', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							users: [{ email: 'test@example.com' }],
						}),
				});

				const result = await formValidationService.validateField(
					'test@example.com',
					'email',
					true
				);

				expect(result).toBe(true);
			});
		});

		describe('username validation', () => {
			it('should validate correct username', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ users: [] }),
				});

				const result = await formValidationService.validateField(
					'validuser',
					'username'
				);

				expect(result).toBe(true);
				expect(mockSetErrorMsg).toHaveBeenCalledWith('');
			});

			it('should reject username that is too short', async () => {
				const result = await formValidationService.validateField(
					'abc',
					'username'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Username must be at least 4 characters long.'
				);
			});

			it('should reject username that is too long', async () => {
				const result = await formValidationService.validateField(
					'verylongusernamethatexceedslimit',
					'username'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Username must be less than 16 characters.'
				);
			});

			it('should reject empty username', async () => {
				const result = await formValidationService.validateField(
					'',
					'username'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put your username.'
				);
			});

			it('should reject username with special characters', async () => {
				const result = await formValidationService.validateField(
					'user@name!',
					'username'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Username must not contain special characters.'
				);
			});

			it('should reject username that already exists', async () => {
				(global.fetch as jest.Mock).mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							users: [{ username: 'existinguser' }],
						}),
				});

				const result = await formValidationService.validateField(
					'existinguser',
					'username'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'This username is already taken.'
				);
			});
		});

		describe('password validation', () => {
			it('should validate strong password', async () => {
				const result = await formValidationService.validateField(
					'Password123',
					'password'
				);

				expect(result).toBe(true);
				expect(mockSetErrorMsg).toHaveBeenCalledWith('');
			});

			it('should reject password that is too short', async () => {
				const result = await formValidationService.validateField(
					'Pass1',
					'password'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Password must be at least 8 characters long.'
				);
			});

			it('should reject password without uppercase letter', async () => {
				const result = await formValidationService.validateField(
					'password123',
					'password'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Password must contain at least one uppercase letter and one number.'
				);
			});

			it('should reject password without number', async () => {
				const result = await formValidationService.validateField(
					'PasswordABC',
					'password'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Password must contain at least one uppercase letter and one number.'
				);
			});

			it('should reject empty password', async () => {
				const result = await formValidationService.validateField(
					'',
					'password'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put your password.'
				);
			});
		});

		describe('confirm password validation', () => {
			it('should validate matching passwords', async () => {
				const result = await formValidationService.validateField(
					'Password123',
					'confirmPassword',
					false,
					null,
					'Password123'
				);

				expect(result).toBe(true);
				expect(mockSetErrorMsg).toHaveBeenCalledWith('');
			});

			it('should reject non-matching passwords', async () => {
				const result = await formValidationService.validateField(
					'Password123',
					'confirmPassword',
					false,
					null,
					'DifferentPass'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Passwords do not match.'
				);
			});

			it('should reject empty confirm password', async () => {
				const result = await formValidationService.validateField(
					'',
					'confirmPassword',
					false,
					null,
					'Password123'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please confirm your password.'
				);
			});

			it('should throw error when password is not provided', async () => {
				await expect(
					formValidationService.validateField(
						'Password123',
						'confirmPassword'
					)
				).rejects.toThrow('Password is required');
			});
		});

		describe('name validation (firstName/lastName)', () => {
			it('should validate correct name', async () => {
				const result = await formValidationService.validateField(
					'John',
					'firstName'
				);

				expect(result).toBe(true);
				expect(mockSetErrorMsg).toHaveBeenCalledWith('');
			});

			it('should validate name with spaces', async () => {
				const result = await formValidationService.validateField(
					'John Doe',
					'firstName'
				);

				expect(result).toBe(true);
			});

			it('should reject empty name', async () => {
				const result = await formValidationService.validateField(
					'',
					'firstName'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put your name.'
				);
			});

			it('should reject name that is too short', async () => {
				const result = await formValidationService.validateField(
					'J',
					'firstName'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Name must be at least 2 characters long.'
				);
			});

			it('should reject name with numbers', async () => {
				const result = await formValidationService.validateField(
					'John123',
					'firstName'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Name must not contain special characters or numbers.'
				);
			});

			it('should reject name with special characters', async () => {
				const result = await formValidationService.validateField(
					'John@',
					'firstName'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Name must not contain special characters or numbers.'
				);
			});
		});

		describe('size validation', () => {
			it('should validate correct size', async () => {
				const result = await formValidationService.validateField(
					'9',
					'size'
				);

				expect(result).toBe(true);
				expect(mockSetErrorMsg).toHaveBeenCalledWith('');
			});

			it('should validate decimal size', async () => {
				const result = await formValidationService.validateField(
					'9.5',
					'size'
				);

				expect(result).toBe(true);
			});

			it('should reject size that is too small', async () => {
				const result = await formValidationService.validateField(
					'0',
					'size'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put a valid size between 1 and 15.'
				);
			});

			it('should reject size that is too large', async () => {
				const result = await formValidationService.validateField(
					'16',
					'size'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put a valid size between 1 and 15.'
				);
			});

			it('should reject size that is not a multiple of 0.5', async () => {
				const result = await formValidationService.validateField(
					'9.3',
					'size'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Size must be a multiple of 0.5.'
				);
			});

			it('should reject empty size', async () => {
				const result = await formValidationService.validateField(
					'',
					'size'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put your size.'
				);
			});

			it('should reject non-numeric size', async () => {
				const result = await formValidationService.validateField(
					'abc',
					'size'
				);

				expect(result).toBe(false);
				expect(mockSetErrorMsg).toHaveBeenCalledWith(
					'Please put a valid size between 1 and 15.'
				);
			});
		});

		it('should focus next input when validation passes', async () => {
			const mockTextInput = { current: { focus: jest.fn() } } as any;

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ users: [] }),
			});

			await formValidationService.validateField(
				'test@example.com',
				'email',
				false,
				mockTextInput
			);

			expect(mockTextInput.current.focus).toHaveBeenCalled();
		});

		it('should set error state when validation fails', async () => {
			const result = await formValidationService.validateField(
				'',
				'email'
			);

			expect(result).toBe(false);
			expect(mockErrorSetters.email).toHaveBeenCalledWith(true);
		});

		it('should clear error state when validation passes', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ users: [] }),
			});

			const result = await formValidationService.validateField(
				'test@example.com',
				'email'
			);

			expect(result).toBe(true);
			expect(mockErrorSetters.email).toHaveBeenCalledWith(false);
		});
	});

	describe('validateConfirmPassword', () => {
		it('should validate matching passwords', () => {
			const result = formValidationService.validateConfirmPassword(
				'Password123',
				'Password123'
			);

			expect(result).toBe(true);
			expect(mockSetErrorMsg).toHaveBeenCalledWith('');
		});

		it('should reject non-matching passwords', () => {
			const result = formValidationService.validateConfirmPassword(
				'Password123',
				'DifferentPass'
			);

			expect(result).toBe(false);
			expect(mockSetErrorMsg).toHaveBeenCalledWith(
				'Passwords do not match.'
			);
		});

		it('should reject empty confirm password', () => {
			const result = formValidationService.validateConfirmPassword(
				'',
				'Password123'
			);

			expect(result).toBe(false);
			expect(mockSetErrorMsg).toHaveBeenCalledWith(
				'Please confirm your password.'
			);
		});
	});

	describe('clearErrors', () => {
		it('should clear all error messages and states', () => {
			formValidationService.clearErrors();

			expect(mockSetErrorMsg).toHaveBeenCalledWith('');
			Object.values(mockErrorSetters).forEach((setter) => {
				expect(setter).toHaveBeenCalledWith(false);
			});
		});
	});

	describe('setErrorMessage', () => {
		it('should set error message', () => {
			formValidationService.setErrorMessage('Custom error message');

			expect(mockSetErrorMsg).toHaveBeenCalledWith(
				'Custom error message'
			);
		});
	});

	describe('API error handling', () => {
		it('should handle fetch errors gracefully for email check', async () => {
			(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error')
			);

			const result = await formValidationService.validateField(
				'test@example.com',
				'email'
			);

			expect(result).toBe(true); // Should return true when API fails
		});

		it('should handle fetch errors gracefully for username check', async () => {
			(global.fetch as jest.Mock).mockRejectedValueOnce(
				new Error('Network error')
			);

			const result = await formValidationService.validateField(
				'testuser',
				'username'
			);

			expect(result).toBe(true); // Should return true when API fails
		});

		it('should handle invalid response format', async () => {
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
			});

			const result = await formValidationService.validateField(
				'test@example.com',
				'email'
			);

			expect(result).toBe(true); // Should return true when API response is invalid
		});
	});
});
