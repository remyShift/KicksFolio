import EditProfileForm from "@/components/screens/app/settings/accountSettings/EditProfileForm";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { mockUseAuth, mockUser } from "../auth/authSetup";
import { ReactTestInstance } from "react-test-renderer";
import { fillAndBlurInput } from "@/__tests__/setup";

describe('Edit Profile Form', () => {
    const renderComponent = () => {
        const result = render(<EditProfileForm />);
        const userNameInput = screen.getByLabelText('Username*');
        const firstNameInput = screen.getByLabelText('First Name*');
        const lastNameInput = screen.getByLabelText('Last Name*');
        const sizeInput = screen.getByLabelText('Sneaker Size*');
        const pageTitle = screen.getByTestId('page-title');
        const mainButton = screen.getByTestId('main-button');
        
        return {
            ...result,
            userNameInput,
            firstNameInput,
            lastNameInput,
            sizeInput,
            pageTitle,
            mainButton,
        };
    };

    it('should render the edit profile form with user data', () => {
        const { userNameInput, firstNameInput, lastNameInput, sizeInput, pageTitle, mainButton } = renderComponent();
        
        expect(userNameInput.props.value).toBe(mockUser.username);
        expect(firstNameInput.props.value).toBe(mockUser.first_name);
        expect(lastNameInput.props.value).toBe(mockUser.last_name);
        expect(sizeInput.props.value).toBe(mockUser.sneaker_size);
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
                    error: 'Sneaker size must be between 7 and 15 (US).',
                    getInput: () => screen.getByLabelText('Sneaker Size*')
                }
            ];

            validationTests.forEach(({ field, input, error, getInput }) => {
                it(`should display an error message and red border for invalid ${field}`, async () => {
                    renderComponent();
                    await fillAndBlurInput(getInput(), input);
                    
                    const errorMessage = screen.queryByTestId('error-message');
                    expect(errorMessage?.props.children).toBe(error);
                    expect(getInput().props.className).toContain('border-2 border-red-500');
                });
            });

            it('should display a global error message if multiple fields are invalid', async () => {
                renderComponent();
                await fillAndBlurInput(screen.getByLabelText('Username*'), 'r');
                await fillAndBlurInput(screen.getByLabelText('Sneaker Size*'), '0');
                
                const errorMessage = screen.queryByTestId('error-message');
                expect(errorMessage?.props.children).toBe('Please correct the errors in the form.');
            });
        });

        describe('form focus', () => {
            const focusTests = [
                { name: 'username', input: () => screen.getByLabelText('Username*') },
                { name: 'first name', input: () => screen.getByLabelText('First Name*') },
                { name: 'last name', input: () => screen.getByLabelText('Last Name*') },
                { name: 'sneaker size', input: () => screen.getByLabelText('Sneaker Size*') }
            ];

            focusTests.forEach(({ name, input }) => {
                it(`should set an orange border to the ${name} input on focus`, async () => {
                    renderComponent();
                    await act(async () => {
                        fireEvent(input(), 'focus');
                    });
                    expect(input().props.className).toContain('border-2 border-orange-500');
                });
            });
        });

        describe('main button state', () => {
            const buttonTests = [
                { 
                    name: 'username',
                    newValue: 'remysnkr',
                    originalValue: () => mockUser.username
                },
                { 
                    name: 'first name',
                    newValue: 'Toto',
                    originalValue: () => mockUser.first_name
                },
                { 
                    name: 'last name',
                    newValue: 'Toto',
                    originalValue: () => mockUser.last_name
                },
                { 
                    name: 'sneaker size',
                    newValue: '9',
                    originalValue: () => mockUser.sneaker_size
                }
            ];

            buttonTests.forEach(({ name, newValue, originalValue }) => {
                it(`should enable button when ${name} is changed to valid value`, async () => {
                    const { mainButton } = renderComponent();
                    const input = screen.getByLabelText(`${name.charAt(0).toUpperCase() + name.slice(1)}*`);
                    await fillAndBlurInput(input, newValue);
                    expect(mainButton.props.accessibilityState.disabled).toBe(false);
                });

                it(`should disable button when ${name} is changed back to original value`, async () => {
                    const { mainButton } = renderComponent();
                    const input = screen.getByLabelText(`${name.charAt(0).toUpperCase() + name.slice(1)}*`);
                    await fillAndBlurInput(input, originalValue());
                    expect(mainButton.props.accessibilityState.disabled).toBe(true);
                });
            });
        });
    });

    describe('form submission', () => {
        it('should submit the form with updated values', async () => {
            const { mainButton } = renderComponent();
            const newUsername = 'remysnkr';
            await fillAndBlurInput(screen.getByLabelText('Username*'), newUsername);

            await act(async () => {
                fireEvent.press(mainButton);
            });

            await waitFor(() => {
                expect(mockUseAuth.updateUser).toHaveBeenCalledWith(
                    mockUser.id,
                    {
                        username: newUsername,
                        first_name: mockUser.first_name,
                        last_name: mockUser.last_name,
                        sneaker_size: parseInt(mockUser.sneaker_size),
                        profile_picture: mockUser.profile_picture_url,
                    }
                );
            });
        });

        it('should handle API errors during submission', async () => {
            const { mainButton } = renderComponent();
            mockUseAuth.updateUser.mockRejectedValueOnce(new Error('API Error'));

            await fillAndBlurInput(screen.getByLabelText('Username*'), 'remysnkr');
            
            await act(async () => {
                fireEvent.press(mainButton);
            });

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.props.children).toBe('An error occurred while updating your profile');
            });
        });

        it('should handle username already taken error', async () => {
            const { mainButton } = renderComponent();
            mockUseAuth.updateUser.mockRejectedValueOnce(new Error('Username already taken'));

            await fillAndBlurInput(screen.getByLabelText('Username*'), 'existinguser');
            
            await act(async () => {
                fireEvent.press(mainButton);
            });

            await waitFor(() => {
                const errorMessage = screen.getByTestId('error-message');
                expect(errorMessage.props.children).toBe('This username is already taken');
            });
        });
    });
});