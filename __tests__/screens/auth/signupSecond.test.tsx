import SignUpSecondPage from '@/app/(auth)/(signup)/sign-up-second';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { act } from 'react';
import { mockAuthService, mockUseAuth, mockUseSignUpProps, resetMocks } from './authSetup';
import { fillAndBlurInput } from '../../setup';
import { ReactTestInstance } from 'react-test-renderer';

jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth,
}));

describe('SignUpSecondPage', () => {
    let firstNameInput: ReactTestInstance;
    let lastNameInput: ReactTestInstance;
    let sneakerSizeInput: ReactTestInstance;
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

        mockUseSignUpProps.signUpProps = {
            email: '',
            password: '',
            username: '',
            first_name: '',
            last_name: '',
            sneaker_size: 0,
            profile_picture: '',
            confirmPassword: ''
        };
        mockUseSignUpProps.setSignUpProps.mockReset();

        render(<SignUpSecondPage />);

        firstNameInput = screen.getByPlaceholderText('John');
        lastNameInput = screen.getByPlaceholderText('Doe');
        sneakerSizeInput = screen.getByPlaceholderText('9.5');
        mainButton = screen.getByTestId('main-button');
    });

    it('should render the sign up second page', () => {
		const pageTitle = screen.getByTestId('page-title');
        const backButton = screen.getByTestId('back-button');

        expect(pageTitle.props.children).toBe('Sign Up');
        expect(backButton).toBeTruthy();
    });

    it('should render the sign up second page form elements with empty values', () => {
        expect(firstNameInput).toBeTruthy();
        expect(lastNameInput).toBeTruthy();
        expect(sneakerSizeInput).toBeTruthy();

        expect(firstNameInput.props.value).toBe('');
        expect(lastNameInput.props.value).toBe('');
        expect(sneakerSizeInput.props.value).toBe('');
    });

    describe('form focus', () => {
        it('should display fields with a orange border on focus', async () => {
            await act(async () => {
                fireEvent(firstNameInput, 'focus');
            });
            await act(async () => {
                fireEvent(lastNameInput, 'focus');
            });
            await act(async () => {
                fireEvent(sneakerSizeInput, 'focus');
            });

            expect(firstNameInput.props.className).toContain('border-2 border-orange-500');
            expect(lastNameInput.props.className).toContain('border-2 border-orange-500');
            expect(sneakerSizeInput.props.className).toContain('border-2 border-orange-500');
        });
    });

    describe('form validation', () => {
        describe('displaying errors', () => {
            it('should display an appropriate error if the first name is not 2 characters long on blur', async () => {
                await fillAndBlurInput(firstNameInput, 'r');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('First name must be at least 2 characters long.');
            });
            
            it('should display an appropriate error if the first name contains special characters on blur', async () => {
                await fillAndBlurInput(firstNameInput, 'rea@');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('First name must not contain special characters or numbers.');
            });
    
            it('should display an appropriate error if the last name is not 2 characters long on blur', async () => {
                await fillAndBlurInput(lastNameInput, 'r');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('Last name must be at least 2 characters long.');
            });
    
            it('should display an appropriate error if the last name contains special characters on blur', async () => {
                await fillAndBlurInput(lastNameInput, 'rea@');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('Last name must not contain special characters or numbers.');
            });
    
            it('should display an appropriate error if the sneaker size is not a number on blur', async () => {
                await fillAndBlurInput(sneakerSizeInput, 'totototo14');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('Sneaker size must be between 3.5 and 15 (US).');
            });
    
            it('should display an appropriate error if the sneaker size is not a number between 7 and 15 on blur', async () => {
                await fillAndBlurInput(sneakerSizeInput, '16');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('Sneaker size must be between 3.5 and 15 (US).');
            });
    
            it('should display an appropriate error if the sneaker size is not a multiple of 0.5 on blur', async () => {
                await fillAndBlurInput(sneakerSizeInput, '10.6');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('Sneaker size must be a multiple of 0.5 (e.g., 7, 7.5, 8, 8.5).');
            });
    
            it('should display a global error message if multiple errors are present', async () => {
                await fillAndBlurInput(firstNameInput, 're');
                await fillAndBlurInput(lastNameInput, 'test@test');
                await fillAndBlurInput(sneakerSizeInput, '10.6');
                const errorMessage = screen.getByTestId('error-message');

                expect(errorMessage.props.children).toBe('Please correct the errors in the form.');
            });
        });

        describe('displaying fields with a red border', () => {            
            it('should display fields with a red border if an error is present', async () => {
                await fillAndBlurInput(firstNameInput, 'r');
                await fillAndBlurInput(lastNameInput, 'test@test');
                await fillAndBlurInput(sneakerSizeInput, '2');
    
                expect(firstNameInput.props.className).toContain('border-2 border-red-500');
                expect(lastNameInput.props.className).toContain('border-2 border-red-500');
                expect(sneakerSizeInput.props.className).toContain('border-2 border-red-500');
            });
        });

        describe('main button', () => {
            it('should display main button disabled if fields are not filled', async () => {
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(true);
            });

            it('should display main button enabled if fields are filled with valid values', async () => {
                await fillAndBlurInput(firstNameInput, 'validFirstName');
                await fillAndBlurInput(lastNameInput, 'validLastName');
                await fillAndBlurInput(sneakerSizeInput, '10.5');
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(false);
            });

            it('should display main button disabled if at least one field is filled with invalid values', async () => {
                await fillAndBlurInput(firstNameInput, 'r');
                await fillAndBlurInput(lastNameInput, 'test@test');
                await fillAndBlurInput(sneakerSizeInput, '10.5');
                const currentMainButton = screen.getByTestId('main-button');

                expect(currentMainButton.props.accessibilityState.disabled).toBe(true);
            });
        });
    });

    describe('Sign up step 2 attempts', () => {
        it('should handle sign up attempt with valid values and values from step 1', async () => {
            mockUseSignUpProps.signUpProps = {
                username: 'validUsername',
                email: 'valid@email.com',
                password: 'ValidPassword14*',
                confirmPassword: 'ValidPassword14*',
                first_name: '',
                last_name: '',
                sneaker_size: 0,
                profile_picture: ''
            };

            await fillAndBlurInput(firstNameInput, 'validFirstName');
            await fillAndBlurInput(lastNameInput, 'validLastName');
            await fillAndBlurInput(sneakerSizeInput, '10.5');
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 200));
            });
            
            const currentMainButton = screen.getByTestId('main-button');
            
            expect(currentMainButton.props.accessibilityState.disabled).toBe(false);
            
            await act(async () => {
                fireEvent(sneakerSizeInput, 'submitEditing');
            });
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(mockUseAuth.signUp).toHaveBeenCalledWith({
                username: 'validUsername',
                email: 'valid@email.com',
                password: 'ValidPassword14*',
                confirmPassword: 'ValidPassword14*',
                first_name: 'ValidFirstName',
                last_name: 'ValidLastName',
                sneaker_size: 10.5,
                profile_picture: ''
            });
        });
        
        it('should not proceed if validation fails on step 2', async () => {
            mockUseSignUpProps.signUpProps = {
                username: 'validUsername',
                email: 'valid@email.com',
                password: 'ValidPassword14*',
                confirmPassword: 'ValidPassword14*',
                first_name: '',
                last_name: '',
                sneaker_size: 0,
                profile_picture: ''
            };

            await fillAndBlurInput(firstNameInput, 'r');
            await fillAndBlurInput(lastNameInput, 'test@test');
            await fillAndBlurInput(sneakerSizeInput, '5');
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 200));
            });
            
            const currentMainButton = screen.getByTestId('main-button');
            
            expect(currentMainButton.props.accessibilityState.disabled).toBe(true);
            
            await act(async () => {
                fireEvent(sneakerSizeInput, 'submitEditing');
            });
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(mockUseAuth.signUp).not.toHaveBeenCalled();
        });
    });
});