import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useAuthValidation } from '@/hooks/useAuthValidation';
import { UserData } from '@/types/auth';

vi.mock('@/domain/AuthValidator', () => ({
	authValidator: {
		checkUsernameExists: vi.fn(),
		checkEmailExists: vi.fn(),
	},
}));

vi.mock('@/interfaces/AuthValidatorInterface', () => ({
	AuthValidatorInterface: {
		checkUsernameExists: vi.fn(),
		checkEmailExists: vi.fn(),
	},
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				'auth.form.username.error.exists': 'Username already exists',
				'auth.form.email.error.exists': 'Email already exists',
				'auth.form.email.error.notExists': 'Email not found',
			};
			return translations[key] || key;
		},
	}),
}));

describe('useAuthValidation', () => {
	let AuthValidatorInterface: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		AuthValidatorInterface = (
			await import('@/interfaces/AuthValidatorInterface')
		).AuthValidatorInterface;
	});

	describe('checkUsernameExists', () => {
		it('should return null for usernames shorter than 4 characters', async () => {
			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkUsernameExists('abc');
			});

			expect(validationResult).toBeNull();
			expect(
				AuthValidatorInterface.checkUsernameExists
			).not.toHaveBeenCalled();
		});

		it('should return username exists error when username exists', async () => {
			AuthValidatorInterface.checkUsernameExists.mockResolvedValue(true);

			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkUsernameExists('testuser');
			});

			expect(validationResult).toBe('Username already exists');
			expect(
				AuthValidatorInterface.checkUsernameExists
			).toHaveBeenCalledWith('testuser', expect.any(Function));
		});

		it('should return null when username is available', async () => {
			AuthValidatorInterface.checkUsernameExists.mockResolvedValue(false);

			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkUsernameExists('testuser');
			});

			expect(validationResult).toBeNull();
		});

		it('should handle errors gracefully', async () => {
			AuthValidatorInterface.checkUsernameExists.mockRejectedValue(
				new Error('Network error')
			);
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkUsernameExists('testuser');
			});

			expect(validationResult).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Error checking username:',
				new Error('Network error')
			);

			consoleSpy.mockRestore();
		});
	});

	describe('checkEmailExists', () => {
		it('should return null for invalid email format', async () => {
			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkEmailExists('invalid-email');
			});

			expect(validationResult).toBeNull();
			expect(
				AuthValidatorInterface.checkEmailExists
			).not.toHaveBeenCalled();
		});

		it('should return email exists error when email exists', async () => {
			AuthValidatorInterface.checkEmailExists.mockResolvedValue(true);

			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkEmailExists(
					'test@example.com'
				);
			});

			expect(validationResult).toBe('Email already exists');
			expect(
				AuthValidatorInterface.checkEmailExists
			).toHaveBeenCalledWith('test@example.com', expect.any(Function));
		});

		it('should return null when email is available', async () => {
			AuthValidatorInterface.checkEmailExists.mockResolvedValue(false);

			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkEmailExists(
					'test@example.com'
				);
			});

			expect(validationResult).toBeNull();
		});
	});

	describe('checkEmailExistsForReset', () => {
		it('should return email not found error when email does not exist', async () => {
			AuthValidatorInterface.checkEmailExists.mockResolvedValue(false);

			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkEmailExistsForReset(
					'test@example.com'
				);
			});

			expect(validationResult).toBe('Email not found');
		});

		it('should return null when email exists', async () => {
			AuthValidatorInterface.checkEmailExists.mockResolvedValue(true);

			const { result } = renderHook(() => useAuthValidation());

			const validationResult = await act(async () => {
				return await result.current.checkEmailExistsForReset(
					'test@example.com'
				);
			});

			expect(validationResult).toBeNull();
		});
	});

	describe('validateSignUpStep1Async', () => {
		it('should return valid result when username and email are available', async () => {
			AuthValidatorInterface.checkUsernameExists.mockResolvedValue(false);
			AuthValidatorInterface.checkEmailExists.mockResolvedValue(false);

			const { result } = renderHook(() => useAuthValidation());

			const userData: UserData = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
				first_name: 'Test',
				last_name: 'User',
				sneaker_size: 42,
				confirmPassword: 'password123',
			};

			const validationResult = await act(async () => {
				return await result.current.validateSignUpStep1Async(userData);
			});

			expect(validationResult).toEqual({
				isValid: true,
				errorMsg: '',
			});
			expect(result.current.errorMsg).toBe('');
		});

		it('should return error when username exists', async () => {
			AuthValidatorInterface.checkUsernameExists.mockResolvedValue(true);

			const { result } = renderHook(() => useAuthValidation());

			const userData: UserData = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
				first_name: 'Test',
				last_name: 'User',
				sneaker_size: 42,
				confirmPassword: 'password123',
			};

			const validationResult = await act(async () => {
				return await result.current.validateSignUpStep1Async(userData);
			});

			expect(validationResult).toEqual({
				isValid: false,
				errorMsg: 'Username already exists',
			});
			expect(result.current.errorMsg).toBe('Username already exists');
		});

		it('should return error when email exists', async () => {
			AuthValidatorInterface.checkUsernameExists.mockResolvedValue(false);
			AuthValidatorInterface.checkEmailExists.mockResolvedValue(true);

			const { result } = renderHook(() => useAuthValidation());

			const userData: UserData = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
				first_name: 'Test',
				last_name: 'User',
				sneaker_size: 42,
				confirmPassword: 'password123',
			};

			const validationResult = await act(async () => {
				return await result.current.validateSignUpStep1Async(userData);
			});

			expect(validationResult).toEqual({
				isValid: false,
				errorMsg: 'Email already exists',
			});
			expect(result.current.errorMsg).toBe('Email already exists');
		});

		it('should handle validation errors gracefully', async () => {
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			AuthValidatorInterface.checkUsernameExists.mockRejectedValue(
				new Error('Network error')
			);
			AuthValidatorInterface.checkEmailExists.mockRejectedValue(
				new Error('Network error')
			);

			const { result } = renderHook(() => useAuthValidation());

			const userData: UserData = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password123',
				first_name: 'Test',
				last_name: 'User',
				sneaker_size: 42,
				confirmPassword: 'password123',
			};

			const validationResult = await act(async () => {
				return await result.current.validateSignUpStep1Async(userData);
			});

			expect(validationResult).toEqual({
				isValid: true,
				errorMsg: '',
			});
			expect(result.current.errorMsg).toBe('');

			consoleSpy.mockRestore();
		});
	});

	describe('errorMsg state management', () => {
		it('should allow setting error message', () => {
			const { result } = renderHook(() => useAuthValidation());

			act(() => {
				result.current.setErrorMsg('Test error');
			});

			expect(result.current.errorMsg).toBe('Test error');
		});
	});
});
