import ResetPasswordPage from "@/app/(auth)/reset-password";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { act } from "react";
import { ReactTestInstance } from "react-test-renderer";
import { fillAndBlurInput } from "../../setup";
import { mockUseAuth, resetMocks } from "./authSetup";

jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth,
}));

describe('Reset Password Page', () => {
    let passwordInput: ReactTestInstance;
    let confirmPasswordInput: ReactTestInstance;
    let mainButton: ReactTestInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        resetMocks();
        
        jest.spyOn(require('expo-router'), 'useLocalSearchParams').mockReturnValue({ token: '1234567890' });
        
        mockUseAuth.resetPassword.mockResolvedValue(true);
        
        render(<ResetPasswordPage />);
        passwordInput = screen.getAllByPlaceholderText('********')[0];
        confirmPasswordInput = screen.getAllByPlaceholderText('********')[1];
        mainButton = screen.getByTestId('main-button');
    });

    it('should render the reset password page', () => {
		const pageTitle = screen.getByTestId('page-title');
        const backButton = screen.getByTestId('back-button');

		expect(pageTitle.props.children).toBe('Reset Password');
        expect(passwordInput).toBeTruthy();
        expect(confirmPasswordInput).toBeTruthy();
        expect(mainButton).toBeTruthy();
        expect(backButton).toBeTruthy();
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
        describe('displaying errors', () => {
            it('should display an error if the password is not provided with appropriate value on blur', async () => {
                await fillAndBlurInput(passwordInput, 'toto');
    
                expect(screen.getByTestId('error-message').props.children).toBe('Password must be at least 8 characters long.');
                expect(screen.getByTestId('main-button').props.accessibilityState.disabled).toBe(true);
            });

            it('should display an error if the confirm password does not match the password', async () => {
                await fillAndBlurInput(passwordInput, 'Tititoto14');
                await fillAndBlurInput(confirmPasswordInput, 'Tititoto15');
    
                expect(screen.getByTestId('error-message').props.children).toBe('Passwords don\'t match.');
                expect(screen.getByTestId('main-button').props.accessibilityState.disabled).toBe(true);
            });

            it('should display a global error message if the password is not provided with appropriate value and the confirm password does not match the password', async () => {
                await fillAndBlurInput(passwordInput, 'toto');
                await fillAndBlurInput(confirmPasswordInput, 'tata');
    
                expect(screen.getByTestId('error-message').props.children).toBe('Please correct the errors in the form.');
                expect(screen.getByTestId('main-button').props.accessibilityState.disabled).toBe(true);
            });
        });

        describe('displaying fields with a red border', () => {            
            it('should put the password input with a red border on blur if the password is not provided with appropriate value', async () => {
                await fillAndBlurInput(passwordInput, 'toto');
    
                expect(passwordInput.props.className).toContain('border-2 border-red-500');
            });
            it('should put the confirm password input with a red border on blur if the confirm password does not match the password', async () => {
                await fillAndBlurInput(passwordInput, 'Tititoto14');
                await fillAndBlurInput(confirmPasswordInput, 'Tititoto15');
    
                expect(confirmPasswordInput.props.className).toContain('border-2 border-red-500');
            });
        });

        describe('main button', () => {
            it('should render the main button with disabled state if fields are not filled', () => {
                expect(mainButton).toBeTruthy();
                expect(mainButton.props.accessibilityState.disabled).toBe(true);
            });

            it('should render the main button with disabled state if the password is not provided with appropriate value', async () => {
                await fillAndBlurInput(passwordInput, 'toto');
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(true);
            });

            it('should render the main button with disabled state if the confirm password does not match the password', async () => {
                await fillAndBlurInput(passwordInput, 'Tititoto14');
                await fillAndBlurInput(confirmPasswordInput, 'Tititoto15');
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(true);
            });

            it('should render the main button with enabled state if fields are filled with appropriate values', async () => {
                await fillAndBlurInput(passwordInput, 'Tititoto14');
                await fillAndBlurInput(confirmPasswordInput, 'Tititoto14');
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(false);
            });
        });
    });

    describe('Reset password attempts', () => {
        it('should call the resetPassword function if the password and confirm password are provided with appropriate value and match', async () => {
            await fillAndBlurInput(passwordInput, 'Tititoto14');
            await fillAndBlurInput(confirmPasswordInput, 'Tititoto14');

            const currentMainButton = screen.getByTestId('main-button');
            
            expect(currentMainButton.props.accessibilityState.disabled).toBe(false);

            await act(async () => {
                fireEvent(confirmPasswordInput, 'submitEditing');
            });
            
            expect(mockUseAuth.resetPassword).toHaveBeenCalledWith('Tititoto14', 'Tititoto14');
        });
    });
});