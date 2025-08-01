import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import LoginPage from '@/app/(auth)/login';
import { fillAndBlurInput } from '../../setup';
import { act } from 'react';
import { ReactTestInstance } from 'react-test-renderer';
import { mockAuthService, mockUseAuth, resetMocks } from './authSetup';


describe('LoginPage', () => {
    let emailInput: ReactTestInstance;
    let passwordInput: ReactTestInstance;
    let errorMessage: ReactTestInstance;
    let mainButton: ReactTestInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        resetMocks();
        mockAuthService.handleLogin.mockReset();
        mockAuthService.login.mockReset();
        mockUseAuth.login.mockReset();
        mockUseAuth.errorMsg = '';
        mockUseAuth.clearError.mockReset();

        render(<LoginPage />);
        emailInput = screen.getByPlaceholderText('john@doe.com');
        passwordInput = screen.getByPlaceholderText('********');
        errorMessage = screen.getByTestId('error-message');
        mainButton = screen.getByTestId('main-button');
    });

    it('should render the login page', () => {
		const pageTitle = screen.getByTestId('page-title');
        const forgotPasswordLink = screen.getByText('Forgot Password?');
        const signUpLink = screen.getByText('Sign Up');

		expect(pageTitle.props.children).toBe('Login');
        expect(forgotPasswordLink).toBeTruthy();
        expect(signUpLink).toBeTruthy();
	});

	it('should render login form elements with empty values', () => {
		expect(emailInput).toBeTruthy();
        expect(emailInput.props.value).toBe('');
        expect(passwordInput).toBeTruthy();
        expect(passwordInput.props.value).toBe('');
	});

    describe('form focus', () => {
        it('should display fields with a orange border on focus', async () => {
            await act(async () => {
                fireEvent(emailInput, 'focus');
            });
            await act(async () => {
                fireEvent(passwordInput, 'focus');
            });

            expect(emailInput.props.className).toContain('border-2 border-orange-500');
            expect(passwordInput.props.className).toContain('border-2 border-orange-500');
        });
    });

    describe('form validation', () => {
        describe('displaying errors', () => {
            it('should not display an error on blur if a regular email is provided', async () => {
                await fillAndBlurInput(emailInput, 'test@test.com');
                expect(emailInput.props.value).toBe('test@test.com');
                expect(errorMessage.props.children).toBe('');
            });

            it('should display an error on blur if an invalid email is provided', async () => {
                await fillAndBlurInput(emailInput, 'test@test');
                expect(errorMessage.props.children).toBe('Please enter a valid email address.');
            });
        });

        describe('main button', () => {
            it('should have the main button disabled if the email or password are empty', async () => {
                expect(mainButton.props.accessibilityState.disabled).toBe(true);
            });

            it('should have the main button enabled if the email and password are provided', async () => {
                await fillAndBlurInput(emailInput, 'test@test.com');
                await fillAndBlurInput(passwordInput, 'password');
                const currentMainButton = screen.getByTestId('main-button');
                expect(currentMainButton.props.accessibilityState.disabled).toBe(false);
            });
        });

        describe('displaying fields with a red border', () => {
            it('should display email input with a red border if invalid email is provided', async () => {
                await fillAndBlurInput(emailInput, 'test@test');

                expect(emailInput.props.className).toContain('border-2 border-red-500');
            });
        });
    });

    describe('Login attempts', () => {
        it('should display an error if the password or email are not correct', async () => {
            mockUseAuth.login.mockRejectedValue('Email or password incorrect');
            mockUseAuth.errorMsg = 'Email or password incorrect';

            await fillAndBlurInput(emailInput, 'test@test.com');
            await fillAndBlurInput(passwordInput, 'password');

            const currentMainButton = screen.getByTestId('main-button');
            await act(async () => {
                fireEvent.press(currentMainButton);
            });
            expect(errorMessage.props.children).toBe('Email or password incorrect');
        });

        it('should handle successful login with correct credentials', async () => {
            mockUseAuth.login.mockResolvedValue(undefined);
            mockUseAuth.errorMsg = '';

            await fillAndBlurInput(emailInput, 'test@test.com');
            await fillAndBlurInput(passwordInput, 'TestToto14*');

            const currentMainButton = screen.getByTestId('main-button');
            await act(async () => {
                fireEvent.press(currentMainButton);
            });
            expect(errorMessage.props.children).toBe('');
        });
    });
});