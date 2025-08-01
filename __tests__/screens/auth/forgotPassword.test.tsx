import ForgotPasswordPage from "@/app/(auth)/forgot-password";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { act } from "react";
import { ReactTestInstance } from "react-test-renderer";
import { fillAndBlurInput } from "../../setup";
import { mockUseAuth, mockUseAsyncValidation, resetMocks } from "./authSetup";

describe('Forgot Password Page', () => {
    let emailInput: ReactTestInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        resetMocks();
        
        mockUseAsyncValidation.checkEmailExistsForReset.mockResolvedValue(null);
        mockUseAuth.forgotPassword.mockResolvedValue(true);
        
        render(<ForgotPasswordPage />);
        emailInput = screen.getByPlaceholderText('john@doe.com');
    });

    it('should render the forgot password page', () => {
        const backButton = screen.getByTestId('back-button');
		const pageTitle = screen.getByTestId('page-title');

		expect(pageTitle.props.children).toBe('Forgot Password');
        expect(backButton).toBeTruthy();
    });

    it('should render the mail input with empty value', () => {
        expect(emailInput).toBeTruthy();
        expect(emailInput.props.value).toBe('');
    });

    describe('form focus', () => {
        it('should put the mail input with a orange border on focus', async () => {
            await act(async () => {
                fireEvent(emailInput, 'focus');
            });
    
            expect(emailInput.props.className).toContain('border-2 border-orange-500');
        });
    });

    describe('form validation', () => {
        describe('displaying errors', () => {
            it('should display an error if the email is not provided with appropriate value on blur', async () => {
                await fillAndBlurInput(emailInput, 'toto');
    
                expect(screen.getByTestId('error-message').props.children).toBe('Please enter a valid email address.');
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(true);
            });
        });

        describe('displaying fields with a red border', () => {            
            it('should put the mail input with a red border on blur if the email is not provided with appropriate value', async () => {
                await fillAndBlurInput(emailInput, 'toto');
    
                expect(emailInput.props.className).toContain('border-2 border-red-500');
            });
        });

        describe('main button', () => {
            it('should render the main button with disabled state', () => {
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton).toBeTruthy();
                expect(currentMainButton.props.accessibilityState.disabled).toBe(true);
            });

            it('should have the main button enabled if the email is provided with appropriate value', async () => {
                await fillAndBlurInput(emailInput, 'john@doe.com');
    
                expect(emailInput.props.value).toBe('john@doe.com');
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(false);
            });
        });
    });

    describe('Forgot password attempts', () => {
        it('should call the forgotPassword function if the email is provided with appropriate value', async () => {
            await fillAndBlurInput(emailInput, 'john@doe.com');
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });
            
            const currentMainButton = screen.getByTestId('main-button');
            
            expect(currentMainButton.props.accessibilityState.disabled).toBe(false);
            
            await act(async () => {
                fireEvent(emailInput, 'submitEditing');
            });
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(mockUseAuth.forgotPassword).toHaveBeenCalledWith('john@doe.com');
        });
    });
});