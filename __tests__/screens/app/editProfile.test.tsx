import EditProfileForm from "@/components/screens/app/settings/accountSettings/EditProfileForm";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { act } from "react";
import { mockUseAuth, mockUser, mockUseAsyncValidation } from "../auth/authSetup";
import { fillAndBlurInput } from "@/__tests__/setup";

describe('Edit Profile Form', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUseAuth.updateUser.mockResolvedValue({ user: mockUser });
        mockUseAsyncValidation.checkUsernameExists.mockResolvedValue(null);
        
        render(<EditProfileForm />);
    });

    it('should render the edit profile form with user data', () => {
        const userNameInput = screen.getByLabelText('Username*');
        const firstNameInput = screen.getByLabelText('First Name*');
        const lastNameInput = screen.getByLabelText('Last Name*');
        const sizeInput = screen.getByLabelText('Sneaker Size*');
        const pageTitle = screen.getByTestId('page-title');
        const mainButton = screen.getByTestId('main-button');

        expect(userNameInput.props.value).toBe(mockUser.username);
        expect(firstNameInput.props.value).toBe(mockUser.first_name);
        expect(lastNameInput.props.value).toBe(mockUser.last_name);
        expect(sizeInput.props.value).toBe('10');
        expect(pageTitle.props.children).toBe('Edit profile');
        expect(mainButton.props.accessibilityState.disabled).toBe(true);
    });

    describe('form validation', () => {
        describe('field validation', () => {
            const validationTests = [
                {
                    field: 'username',
                    input: 'r',
                    error: 'Username must be between 4 and 16 characters.',
                    getInput: () => screen.getByLabelText('Username*')
                },
                {
                    field: 'first name',
                    input: 'T',
                    error: 'First name must be at least 2 characters long.',
                    getInput: () => screen.getByLabelText('First Name*')
                },
                {
                    field: 'last name',
                    input: 'T',
                    error: 'Last name must be at least 2 characters long.',
                    getInput: () => screen.getByLabelText('Last Name*')
                },
                {
                    field: 'sneaker size',
                    input: '0',
                    error: 'Sneaker size must be between 3.5 and 15 (US).',
                    getInput: () => screen.getByLabelText('Sneaker Size*')
                }
            ];

            validationTests.forEach(({ field, input, error, getInput }) => {
                it(`should display an error message and red border for invalid ${field}`, async () => {
                    await fillAndBlurInput(getInput(), input);
                    
                    const errorMessage = screen.queryByTestId('error-message');
                    expect(errorMessage?.props.children).toBe(error);
                    expect(getInput().props.className).toContain('border-2 border-red-500');
                });
            });

            it('should display a global error message if multiple fields are invalid', async () => {
                const userNameInput = screen.getByLabelText('Username*');
                const sizeInput = screen.getByLabelText('Sneaker Size*');
                
                await fillAndBlurInput(userNameInput, 'r');
                await fillAndBlurInput(sizeInput, '0');
                
                const errorMessage = screen.queryByTestId('error-message');
                expect(errorMessage?.props.children).toBe('Please correct the errors in the form.');
            });
        });

        describe('form focus', () => {
            const focusTests = [
                { name: 'username', label: 'Username*' },
                { name: 'first name', label: 'First Name*' },
                { name: 'last name', label: 'Last Name*' },
                { name: 'sneaker size', label: 'Sneaker Size*' }
            ];

            focusTests.forEach(({ name, label }) => {
                it(`should set an orange border to the ${name} input on focus`, async () => {
                    const input = screen.getByLabelText(label);
                    await act(async () => {
                        fireEvent(input, 'focus');
                    });
                    expect(input.props.className).toContain('border-2 border-orange-500');
                });
            });
        });

        describe('main button state', () => {
            const buttonTests = [
                { 
                    name: 'username',
                    label: 'Username*',
                    newValue: 'remysnkr',
                    originalValue: mockUser.username
                },
                { 
                    name: 'first name',
                    label: 'First Name*',
                    newValue: 'Toto',
                    originalValue: mockUser.first_name
                },
                { 
                    name: 'last name',
                    label: 'Last Name*',
                    newValue: 'Toto',
                    originalValue: mockUser.last_name
                },
                { 
                    name: 'sneaker size',
                    label: 'Sneaker Size*',
                    newValue: '9',
                    originalValue: '10'
                }
            ];

            buttonTests.forEach(({ name, label, newValue, originalValue }) => {
                it(`should enable button when ${name} is changed to valid value`, async () => {
                    const input = screen.getByLabelText(label);
                    await fillAndBlurInput(input, newValue);
                    const mainButton = screen.getByTestId('main-button');
                    expect(mainButton.props.accessibilityState.disabled).toBe(false);
                });

                it(`should disable button when ${name} is changed back to original value`, async () => {
                    const input = screen.getByLabelText(label);
                    await fillAndBlurInput(input, originalValue);
                    const mainButton = screen.getByTestId('main-button');
                    expect(mainButton.props.accessibilityState.disabled).toBe(true);
                });
            });
        });
    });

    describe('form submission', () => {
        it('should submit the form with updated values', async () => {
            const newUsername = 'remysnkr';
            const usernameInput = screen.getByLabelText('Username*');
            
            await fillAndBlurInput(usernameInput, newUsername);
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 200));
            });
            
            const mainButton = screen.getByTestId('main-button');
            
            expect(mainButton.props.accessibilityState.disabled).toBe(false);
            
            const sizeInput = screen.getByLabelText('Sneaker Size*');
            
            await act(async () => {
                fireEvent(sizeInput, 'submitEditing');
            });
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(mockUseAuth.updateUser).toHaveBeenCalledWith(
                mockUser.id,
                {
                    username: newUsername,
                    first_name: mockUser.first_name,
                    last_name: mockUser.last_name,
                    sneaker_size: parseInt(mockUser.sneaker_size),
                    profile_picture: '',
                }
            );
        });

        it('should handle API errors during submission', async () => {
            mockUseAuth.updateUser.mockRejectedValueOnce(new Error('API Error'));
            
            const usernameInput = screen.getByLabelText('Username*');
            await fillAndBlurInput(usernameInput, 'newUsername');
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 200));
            });
            
            const sizeInput = screen.getByLabelText('Sneaker Size*');
            
            await act(async () => {
                fireEvent(sizeInput, 'submitEditing');
            });
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(mockUseAuth.updateUser).toHaveBeenCalled();
        });

        it('should handle username already taken error', async () => {
            const usernameInput = screen.getByLabelText('Username*');
            await fillAndBlurInput(usernameInput, 'existingUser');
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 200));
            });
            
            const sizeInput = screen.getByLabelText('Sneaker Size*');
            
            await act(async () => {
                fireEvent(sizeInput, 'submitEditing');
            });
            
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(mockUseAuth.updateUser).toHaveBeenCalled();
        });
    });
});