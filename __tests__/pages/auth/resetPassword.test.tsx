import ResetPasswordPage from "@/app/(auth)/reset-password";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ReactTestInstance } from "react-test-renderer";
import { fillAndBlurInput } from "../../setup";
import { mockUseAuth } from "./authSetup";

describe('Reset Password Page', () => {
    let passwordInput: ReactTestInstance;
    let confirmPasswordInput: ReactTestInstance;
    let mainButton: ReactTestInstance;

    beforeEach(() => {
        jest.spyOn(require('expo-router'), 'useLocalSearchParams').mockReturnValue({ token: '1234567890' });

        render(<ResetPasswordPage />);
        passwordInput = screen.getAllByPlaceholderText('********')[0];
        confirmPasswordInput = screen.getAllByPlaceholderText('********')[1];
        mainButton = screen.getByTestId('main-button');
    });

    it('should render the reset password page', () => {
		const pageTitle = screen.getByTestId('page-title');

		expect(pageTitle.props.children).toBe('Reset Password');
        expect(passwordInput).toBeTruthy();
        expect(confirmPasswordInput).toBeTruthy();
        expect(mainButton).toBeTruthy();
    });

    it('should render the password and confirm password inputs with empty value', () => {
        expect(passwordInput.props.value).toBe('');
        expect(confirmPasswordInput.props.value).toBe('');
    });

    describe('form focus', () => {
        it('should put the password input with a orange border on focus', async () => {
            await act(async () => {
                fireEvent(passwordInput, 'focus');
            });
    
            expect(passwordInput.props.className).toContain('border-2 border-orange-500');
        });

        it('should put the confirm password input with a orange border on focus', async () => {
            await act(async () => {
                fireEvent(confirmPasswordInput, 'focus');
            });
    
            expect(confirmPasswordInput.props.className).toContain('border-2 border-orange-500');
        });
    });

    describe('form validation', () => {
        it('should display an error if the password is not provided with appropriate value on blur', async () => {
            await fillAndBlurInput(passwordInput, 'toto');

            expect(screen.getByTestId('error-message').props.children).toBe('Password must be at least 8 characters long.');
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should put the password input with a red border on blur if the password is not provided with appropriate value', async () => {
            await fillAndBlurInput(passwordInput, 'toto');

            expect(passwordInput.props.className).toContain('border-2 border-red-500');
        });

        it('should display an error if the confirm password does not match the password', async () => {
            await fillAndBlurInput(passwordInput, 'Tititoto14');
            await fillAndBlurInput(confirmPasswordInput, 'Tititoto15');

            expect(screen.getByTestId('error-message').props.children).toBe('Passwords don\'t match.');
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should put the confirm password input with a red border on blur if the confirm password does not match the password', async () => {
            await fillAndBlurInput(passwordInput, 'Tititoto14');
            await fillAndBlurInput(confirmPasswordInput, 'Tititoto15');

            expect(confirmPasswordInput.props.className).toContain('border-2 border-red-500');
        });

        it('should display a global error message if the password is not provided with appropriate value and the confirm password does not match the password', async () => {
            await fillAndBlurInput(passwordInput, 'toto');
            await fillAndBlurInput(confirmPasswordInput, 'tata');

            expect(screen.getByTestId('error-message').props.children).toBe('Please correct the fields in red before continuing');
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should render the main button with disabled state', () => {
            expect(mainButton).toBeTruthy();
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should have the main button enabled if the password and confirm password are provided with appropriate value and match', async () => {
            await fillAndBlurInput(passwordInput, 'Tititoto14');
            await fillAndBlurInput(confirmPasswordInput, 'Tititoto14');

            expect(mainButton.props.accessibilityState.disabled).toBe(false);
        });
    });

    describe('Reset password attempts', () => {
        it('should call the resetPassword function if the password and confirm password are provided with appropriate value and match', async () => {
            await fillAndBlurInput(passwordInput, 'Tititoto14');
            await fillAndBlurInput(confirmPasswordInput, 'Tititoto14');

            const password = passwordInput.props.value;
            const confirmPassword = confirmPasswordInput.props.value;

            await act(async () => {
                fireEvent.press(mainButton);
            });

            expect(mockUseAuth.resetPassword).toHaveBeenCalledWith('1234567890', password, confirmPassword);
        });
    });
});