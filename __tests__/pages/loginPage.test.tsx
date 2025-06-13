import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import LoginPage from '@/app/(auth)/login';
import { act } from 'react';
import { ReactTestInstance } from 'react-test-renderer';
import { useRouter } from 'expo-router';

const mockAuthService = {
    handleLogin: jest.fn(),
    login: jest.fn()
};

jest.mock('@/services/AuthService', () => ({
    AuthService: jest.fn().mockImplementation(() => mockAuthService)
}));

const mockUseAuth = {
    login: jest.fn(),
    errorMsg: '',
    clearError: jest.fn()
};

jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth
}));

describe('LoginPage', () => {
    let emailInput: ReactTestInstance;
    let passwordInput: ReactTestInstance;
    let errorMessage: ReactTestInstance;
    let mainButton: ReactTestInstance;

    beforeEach(() => {
        jest.clearAllMocks();
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

    afterEach(() => {
        cleanup();
    });

    const fillInputs = async (emailValue: string = '', passwordValue: string = '') => {
        await act(async () => {
            fireEvent.changeText(emailInput, emailValue);
        });
        await act(async () => {
            fireEvent(emailInput, 'blur');
        });
        await act(async () => {
            fireEvent.changeText(passwordInput, passwordValue);
        });
        await act(async () => {
            fireEvent(passwordInput, 'blur');
        });
    }

    it('should render the login page', () => {
		const pageTitle = screen.getByTestId('page-title');
		expect(pageTitle.props.children).toBe('Login');
	});

	it('should render login form elements', () => {
		expect(emailInput).toBeTruthy();
        expect(emailInput.props.value).toBe('');
        expect(passwordInput).toBeTruthy();
        expect(passwordInput.props.value).toBe('');
	});

    it('should not display an error on blur if a regular email is provided', async () => {
        await fillInputs('test@test.com');
        expect(emailInput.props.value).toBe('test@test.com');
        expect(errorMessage.props.children).toBe('');
    });

    it('should display an error on blur if an invalid email is provided', async () => {
        await fillInputs('test@test');
        expect(errorMessage.props.children).toBe('Please put a valid email.');
    });

    it('should have the main button disabled if the email or password are empty', async () => {
        expect(mainButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should have the main button enabled if the email and password are provided', async () => {
        await fillInputs('test@test.com', 'password');
        expect(mainButton.props.accessibilityState.disabled).toBe(false);
    });

    describe('Login attempts', () => {
        const originalConsoleError = console.error;

        beforeEach(() => {
            console.error = jest.fn();
        });

        afterEach(() => {
            console.error = originalConsoleError;
        });

        it('should display an error if the password or email are not correct', async () => {
            mockUseAuth.login.mockRejectedValue('Email or password incorrect');
            mockUseAuth.errorMsg = 'Email or password incorrect';

            await fillInputs('test@test.com', 'password');
            await act(async () => {
                fireEvent.press(mainButton);
            });
            expect(errorMessage.props.children).toBe('Email or password incorrect');
        });

        it('should handle successful login with correct credentials', async () => {
            mockUseAuth.login.mockResolvedValue(undefined);
            mockUseAuth.errorMsg = '';

            await fillInputs('test@test.com', 'TestToto14*');
            await act(async () => {
                fireEvent.press(mainButton);
            });
            expect(errorMessage.props.children).toBe('');
        });
    });
});