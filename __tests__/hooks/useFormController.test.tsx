import { renderHook } from '@testing-library/react-native';
import { act } from 'react';
import { useFormController } from '../../hooks/useFormController';
import { z } from 'zod';
import { mockUseAuth } from '../screens/auth/authSetup';

jest.mock('@/hooks/useAuth', () => ({
	useAuth: () => mockUseAuth,
}));

jest.mock('@/context/authContext', () => ({
	useSession: () => ({
		refreshUserData: jest.fn(),
	}),
}));

const testSchema = z.object({
	username: z.string().min(2, 'Username must be at least 2 characters'),
	email: z.string().email('Invalid email'),
});

type TestFormData = z.infer<typeof testSchema>;

const mockAsyncValidation = {
	username: jest.fn(),
	email: jest.fn(),
};

const mockOnSubmit = jest.fn();

describe('useFormController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAsyncValidation.username.mockResolvedValue(null);
		mockAsyncValidation.email.mockResolvedValue(null);
	});

	describe('Field Focus Behavior', () => {
		it('should call clearErrors and clearAsyncError when handleFieldFocus is called', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
					fieldNames: ['username', 'email'],
					enableClearError: true,
				})
			);

			await act(async () => {
				mockAsyncValidation.username.mockResolvedValueOnce('Username already exists');
				await result.current.validateFieldAsync('username', 'testuser');
			});

			expect(result.current.hasFieldError('username')).toBe(true);

			await act(async () => {
				result.current.handleFieldFocus('username');
			});

			expect(result.current.hasFieldError('username')).toBe(false);
		});

		it('should call clearError from useAuth when enableClearError is true', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					enableClearError: true,
				})
			);

			await act(async () => {
				result.current.handleFieldFocus('username');
			});

			expect(mockUseAuth.clearError).toHaveBeenCalled();
		});

		it('should not call clearError from useAuth when enableClearError is false', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					enableClearError: false,
				})
			);

			await act(async () => {
				result.current.handleFieldFocus('username');
			});

			expect(mockUseAuth.clearError).not.toHaveBeenCalled();
		});
	});

	describe('Field Blur Behavior', () => {
		it('should call validation trigger on blur', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				result.current.setValue('username', 'u');
				await result.current.trigger('username');
			});

			expect(result.current.hasFieldError('username')).toBe(true);
			expect(result.current.getFieldError('username')).toBe('Username must be at least 2 characters');
		});

		it('should call async validation when field has value and async validation is defined', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				result.current.setValue('username', 'validuser');
				await result.current.validateFieldOnBlur('username', 'validuser');
			});

			expect(mockAsyncValidation.username).toHaveBeenCalledWith('validuser');
		});

		it('should not call async validation when field is empty', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				await result.current.validateFieldOnBlur('username', '');
			});

			expect(mockAsyncValidation.username).not.toHaveBeenCalled();
		});

		it('should not call async validation when field only contains whitespace', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				await result.current.validateFieldOnBlur('username', '   ');
			});

			expect(mockAsyncValidation.username).not.toHaveBeenCalled();
		});
	});

	describe('Async Validation', () => {
		it('should set async error when async validation fails', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				mockAsyncValidation.username.mockResolvedValueOnce('Username already exists');
				await result.current.validateFieldAsync('username', 'testuser');
			});

			expect(result.current.hasFieldError('username')).toBe(true);
			expect(result.current.getFieldError('username')).toBe('Username already exists');
		});

		it('should clear async error when async validation succeeds', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				mockAsyncValidation.username.mockResolvedValueOnce('Username already exists');
				await result.current.validateFieldAsync('username', 'testuser');
			});

			expect(result.current.hasFieldError('username')).toBe(true);

			await act(async () => {
				mockAsyncValidation.username.mockResolvedValueOnce(null);
				await result.current.validateFieldAsync('username', 'newuser');
			});

			expect(result.current.hasFieldError('username')).toBe(false);
		});
	});

	describe('Error Display Logic', () => {
		it('should display global error when multiple fields have errors', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					fieldNames: ['username', 'email'],
				})
			);

			await act(async () => {
				result.current.setValue('username', 'u');
				result.current.setValue('email', 'invalid');
				await result.current.trigger('username');
				await result.current.trigger('email');
			});

			expect(result.current.hasMultipleErrors).toBe(true);
			expect(result.current.displayedError).toBe('Please correct the errors in the form.');
		});

		it('should display specific error when only one field has error', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					fieldNames: ['username', 'email'],
				})
			);

			await act(async () => {
				result.current.setValue('username', 'u');
				await result.current.validateFieldOnBlur('username', 'u');
			});

			expect(result.current.hasMultipleErrors).toBe(false);
			expect(result.current.displayedError).toBe('Username must be at least 2 characters');
		});

		it('should display auth error when no field errors exist', () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					fieldNames: ['username', 'email'],
					authErrorMsg: 'Authentication failed',
				})
			);

			expect(result.current.displayedError).toBe('Authentication failed');
		});
	});

	describe('Form Submission', () => {
		it('should call onSubmit when form is valid', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
				})
			);

			await act(async () => {
				result.current.setValue('username', 'validuser');
				result.current.setValue('email', 'valid@email.com');
				await result.current.handleFormSubmit();
			});

			expect(mockOnSubmit).toHaveBeenCalledWith({
				username: 'validuser',
				email: 'valid@email.com',
			});
		});

		it('should process async validation before submission', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				result.current.setValue('username', 'validuser');
				result.current.setValue('email', 'valid@email.com');
				await result.current.handleFormSubmit();
			});

			expect(mockAsyncValidation.username).toHaveBeenCalledWith('validuser');
			expect(mockAsyncValidation.email).toHaveBeenCalledWith('valid@email.com');
			expect(mockOnSubmit).toHaveBeenCalled();
		});

		it('should not call onSubmit when async validation fails', async () => {
			const { result } = renderHook(() =>
				useFormController<TestFormData>({
					schema: testSchema,
					onSubmit: mockOnSubmit,
					asyncValidation: mockAsyncValidation,
				})
			);

			await act(async () => {
				mockAsyncValidation.username.mockResolvedValueOnce('Username already exists');
				result.current.setValue('username', 'testuser');
				result.current.setValue('email', 'valid@email.com');
				await result.current.handleFormSubmit();
			});

			expect(mockOnSubmit).not.toHaveBeenCalled();
		});
	});
}); 