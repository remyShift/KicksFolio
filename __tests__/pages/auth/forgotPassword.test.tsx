import ForgotPasswordPage from "@/app/(auth)/forgot-password";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ReactTestInstance } from "react-test-renderer";
import { fillAndBlurInput } from "../../setup";
import { mockUseAuth } from "./authSetup";

describe('Forgot Password Page', () => {
    let emailInput: ReactTestInstance;
    let mainButton: ReactTestInstance;

    beforeEach(() => {
        render(<ForgotPasswordPage />);
        emailInput = screen.getByPlaceholderText('john@doe.com');
        mainButton = screen.getByTestId('main-button');
    });

    it('should render the forgot password page', () => {
        const backToLoginLink = screen.getByText('Back to Login');
		const pageTitle = screen.getByTestId('page-title');

		expect(pageTitle.props.children).toBe('Forgot Password');
        expect(backToLoginLink).toBeTruthy();
    });

    it('should render the mail input with empty value', () => {
        expect(emailInput).toBeTruthy();
        expect(emailInput.props.value).toBe('');
    });

    it('should display an error if the email is not provided with appropriate value on blur', async () => {
        await fillAndBlurInput(emailInput, 'toto');

        expect(screen.getByTestId('error-message').props.children).toBe('Please enter a valid email address.');
        expect(mainButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should put the mail input with a red border on blur if the email is not provided with appropriate value', async () => {
        await fillAndBlurInput(emailInput, 'toto');

        expect(emailInput.props.className).toContain('border-2 border-red-500');
    });

    it('should put the mail input with a orange border on focus', async () => {
        await act(async () => {
            fireEvent(emailInput, 'focus');
        });

        expect(emailInput.props.className).toContain('border-2 border-orange-500');
    });
    
    it('should render the main button with disabled state', () => {
        expect(mainButton).toBeTruthy();
        expect(mainButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should have the main button enabled if the email is provided with appropriate value', async () => {
        await fillAndBlurInput(emailInput, 'john@doe.com');

        expect(emailInput.props.value).toBe('john@doe.com');
        expect(mainButton.props.accessibilityState.disabled).toBe(false);
    });

    describe('Forgot password attempts', () => {
        it('should call the forgotPassword function if the email is provided with appropriate value', async () => {
            await fillAndBlurInput(emailInput, 'john@doe.com');
            await act(async () => {
                fireEvent.press(mainButton);
            });

            expect(mockUseAuth.forgotPassword).toHaveBeenCalledWith('john@doe.com');
        });
    });
});