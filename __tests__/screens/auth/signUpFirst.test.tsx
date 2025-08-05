import { act } from 'react';
import { ReactTestInstance } from 'react-test-renderer';

import { fireEvent, render, screen } from '@testing-library/react-native';

import SignUpFirstPage from '@/app/(auth)/(signup)/sign-up';

import { fillAndBlurInput } from '../../setup';
import {
	mockAuthService,
	mockUseAuth,
	mockUseValidation,
	resetMocks,
} from '../../setup/auth';

jest.mock('@/hooks/useAuth', () => ({
	useAuth: () => mockUseAuth,
}));

describe('SignUpFirstPage', () => {
	let userNameInput: ReactTestInstance;
	let emailInput: ReactTestInstance;
	let passwordInput: ReactTestInstance;
	let confirmPasswordInput: ReactTestInstance;
	let passwordInputs: ReactTestInstance[];
	let mainButton: ReactTestInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		resetMocks();
		mockAuthService.handleSignUp.mockReset();
		mockAuthService.signUp.mockReset();
		mockUseAuth.signUp.mockReset();
		mockUseAuth.clearError.mockReset();
		mockUseAuth.handleNextSignupPage.mockReset();
		mockUseAuth.errorMsg = '';

		mockUseValidation.checkUsernameExists.mockResolvedValue(null);
		mockUseValidation.checkEmailExists.mockResolvedValue(null);

		render(<SignUpFirstPage />);

		userNameInput = screen.getByPlaceholderText('johnSneakers');
		emailInput = screen.getByPlaceholderText('john@doe.com');
		passwordInputs = screen.getAllByPlaceholderText('********');
		passwordInput = passwordInputs[0];
		confirmPasswordInput = passwordInputs[1];
		mainButton = screen.getByTestId('main-button');
	});

	it('should render the sign up first page', () => {
		const pageTitle = screen.getByTestId('page-title');
		const backButton = screen.getByTestId('back-button');

		expect(pageTitle.props.children).toBe('Sign Up');
		expect(backButton).toBeTruthy();
	});

	it('should render the sign up first page form elements with empty values', () => {
		expect(userNameInput).toBeTruthy();
		expect(emailInput).toBeTruthy();
		expect(passwordInput).toBeTruthy();
		expect(confirmPasswordInput).toBeTruthy();

		expect(userNameInput.props.value).toBe('');
		expect(emailInput.props.value).toBe('');
		expect(passwordInput.props.value).toBe('');
		expect(confirmPasswordInput.props.value).toBe('');
	});

	describe('form focus', () => {
		it('should display fields with a orange border on focus', async () => {
			await act(async () => {
				fireEvent(userNameInput, 'focus');
			});
			await act(async () => {
				fireEvent(emailInput, 'focus');
			});
			await act(async () => {
				fireEvent(passwordInput, 'focus');
			});
			await act(async () => {
				fireEvent(confirmPasswordInput, 'focus');
			});

			expect(userNameInput.props.className).toContain(
				'border-2 border-orange-500'
			);
			expect(emailInput.props.className).toContain(
				'border-2 border-orange-500'
			);
			expect(passwordInput.props.className).toContain(
				'border-2 border-orange-500'
			);
			expect(confirmPasswordInput.props.className).toContain(
				'border-2 border-orange-500'
			);
		});
	});

	describe('form validation', () => {
		describe('displaying errors', () => {
			it('should display an appropriate error if the username is not 4 characters long on blur', async () => {
				await fillAndBlurInput(userNameInput, 'r');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'Username must be between 4 and 16 characters.'
				);
			});

			it('should display an appropriate error if the username contains special characters on blur', async () => {
				await fillAndBlurInput(userNameInput, 'rea@');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'Username must not contain special characters.'
				);
			});

			it('should display an appropriate error if the username is already taken on blur', async () => {
				mockUseValidation.checkUsernameExists.mockResolvedValue(
					'This username is already taken.'
				);
				await fillAndBlurInput(userNameInput, 'johnSneakers');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'This username is already taken.'
				);
			});

			it('should display an appropriate error if the email is not a valid email on blur', async () => {
				await fillAndBlurInput(emailInput, 'test@test');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'Please enter a valid email address.'
				);
			});

			it('should display an appropriate error if the password is not 8 characters long on blur', async () => {
				await fillAndBlurInput(passwordInput, '1234567');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'Password must be at least 8 characters long.'
				);
			});

			it('should display an appropriate error if the password does not contain at least one uppercase letter on blur', async () => {
				await fillAndBlurInput(passwordInput, 'totototo14');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'Password must contain at least 1 uppercase letter and 1 number.'
				);
			});

			it('should display an appropriate error if the password does not contain at least one number on blur', async () => {
				await fillAndBlurInput(passwordInput, 'Totototo');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'Password must contain at least 1 uppercase letter and 1 number.'
				);
			});

			it('should display an appropriate error if the password does not match the confirm password on blur', async () => {
				await fillAndBlurInput(passwordInput, 'Totototo14');
				await fillAndBlurInput(confirmPasswordInput, 'Totototo14*');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					"Passwords don't match."
				);
			});

			it('should display a global error message if multiple errors are present', async () => {
				await fillAndBlurInput(userNameInput, 're');
				await fillAndBlurInput(emailInput, 'test@test');

				const errorMessage = screen.getByTestId('error-message');
				expect(errorMessage.props.children).toBe(
					'Please correct the errors in the form.'
				);
			});
		});

		describe('displaying fields with a red border', () => {
			it('should display fields with a red border if an error is present', async () => {
				await fillAndBlurInput(userNameInput, 're');
				await fillAndBlurInput(emailInput, 'test@test');
				await fillAndBlurInput(passwordInput, 'totototo14');
				await fillAndBlurInput(confirmPasswordInput, 'Totototo14*');

				expect(userNameInput.props.className).toContain(
					'border-2 border-red-500'
				);
				expect(emailInput.props.className).toContain(
					'border-2 border-red-500'
				);
				expect(passwordInput.props.className).toContain(
					'border-2 border-red-500'
				);
				expect(confirmPasswordInput.props.className).toContain(
					'border-2 border-red-500'
				);
			});
		});

		describe('main button', () => {
			it('should display main button disabled if fields are not filled', async () => {
				expect(mainButton.props.accessibilityState.disabled).toBe(true);
			});

			it('should display main button enabled if fields are filled with valid values', async () => {
				mockUseValidation.checkUsernameExists.mockResolvedValue(null);
				mockUseValidation.checkEmailExists.mockResolvedValue(null);
				await fillAndBlurInput(userNameInput, 'validUsername');
				await fillAndBlurInput(emailInput, 'valid@email.com');
				await fillAndBlurInput(passwordInput, 'ValidPassword14*');
				await fillAndBlurInput(
					confirmPasswordInput,
					'ValidPassword14*'
				);

				const currentMainButton = screen.getByTestId('main-button');
				expect(
					currentMainButton.props.accessibilityState.disabled
				).toBe(false);
			});

			it('should display main button disabled if at least one field is filled with invalid values', async () => {
				await fillAndBlurInput(userNameInput, 'r');
				await fillAndBlurInput(emailInput, 'test@test');
				await fillAndBlurInput(passwordInput, 'totototo14');
				await fillAndBlurInput(confirmPasswordInput, 'Totototo14*');

				const currentMainButton = screen.getByTestId('main-button');
				expect(
					currentMainButton.props.accessibilityState.disabled
				).toBe(true);
			});
		});
	});

	describe('Sign up step 1 attempts', () => {
		it('should handle sign up attempt with valid values and redirect to step 2', async () => {
			await fillAndBlurInput(userNameInput, 'validUsername');
			await fillAndBlurInput(emailInput, 'valid@email.com');
			await fillAndBlurInput(passwordInput, 'ValidPassword14*');
			await fillAndBlurInput(confirmPasswordInput, 'ValidPassword14*');

			const currentMainButton = screen.getByTestId('main-button');

			expect(currentMainButton.props.accessibilityState.disabled).toBe(
				false
			);

			await act(async () => {
				fireEvent(confirmPasswordInput, 'submitEditing');
			});

			expect(mockUseAuth.handleNextSignupPage).toHaveBeenCalledWith({
				username: 'validUsername',
				email: 'valid@email.com',
				password: 'ValidPassword14*',
				confirmPassword: 'ValidPassword14*',
				first_name: '',
				last_name: '',
				profile_picture: '',
				sneaker_size: 0,
			});
		});

		it('should not proceed to next step if validation fails', async () => {
			await fillAndBlurInput(userNameInput, 're');
			await fillAndBlurInput(emailInput, 'test@test');
			await fillAndBlurInput(passwordInput, 'totototo14');
			await fillAndBlurInput(confirmPasswordInput, 'Totototo14*');
			await act(async () => {
				fireEvent.press(mainButton);
			});
			expect(mockUseAuth.handleNextSignupPage).not.toHaveBeenCalled();
		});
	});
});
