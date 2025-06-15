import EditProfileForm from "@/components/screens/app/profile/EditProfileForm";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { mockUseAuth, mockUser } from "../auth/authSetup";
import { ReactTestInstance } from "react-test-renderer";
import { fillAndBlurInput } from "@/__tests__/setup";

describe('Edit Profile Form', () => {
    let userNameInput: ReactTestInstance;
    let firstNameInput: ReactTestInstance;
    let lastNameInput: ReactTestInstance;
    let sizeInput: ReactTestInstance;
    let pageTitle: ReactTestInstance;
    let mainButton: ReactTestInstance;
    let errorMessage: ReactTestInstance;

    beforeEach(() => {
        render(<EditProfileForm />);
        userNameInput = screen.getByLabelText('*Username');
        firstNameInput = screen.getByLabelText('*First Name');
        lastNameInput = screen.getByLabelText('*Last Name');
        sizeInput = screen.getByLabelText('*Sneaker Size');
        pageTitle = screen.getByTestId('page-title');
        mainButton = screen.getByTestId('main-button');
        errorMessage = screen.getByTestId('error-message');
    });

    it('should render the edit profile form with user data', () => {
        expect(userNameInput.props.value).toBe(mockUser.username);
        expect(firstNameInput.props.value).toBe(mockUser.first_name);
        expect(lastNameInput.props.value).toBe(mockUser.last_name);
        expect(sizeInput.props.value).toBe(mockUser.sneaker_size);
        expect(pageTitle.props.children).toBe('Edit profile');
    });

    it('should have the main button button disabled if no value have changed', () => {
        expect(mainButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should have the main button button enabled if the username is changed', async () => {
        await fillAndBlurInput(userNameInput, 'remysnkr');
        expect(mainButton.props.accessibilityState.disabled).toBe(false);
    });

    describe('form validation', () => {
        it('should have the main button button disabled if the username is changed to the same value on blur', async () => {
            await fillAndBlurInput(userNameInput, mockUser.username);
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should have the main button button enabled if the first name is changed on blur', async () => {
            await fillAndBlurInput(firstNameInput, 'Toto');
            expect(mainButton.props.accessibilityState.disabled).toBe(false);
        });

        it('should have the main button button disabled if the first name is changed to the same value on blur', async () => {
            await fillAndBlurInput(firstNameInput, mockUser.first_name);
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should have the main button button enabled if the last name is changed on blur', async () => {
            await fillAndBlurInput(lastNameInput, 'Toto');
            expect(mainButton.props.accessibilityState.disabled).toBe(false);
        });

        it('should have the main button button disabled if the last name is changed to the same value on blur', async () => {
            await fillAndBlurInput(lastNameInput, mockUser.last_name);
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should have the main button button enabled if the sneaker size is changed on blur', async () => {
            await fillAndBlurInput(sizeInput, '9');
            expect(mainButton.props.accessibilityState.disabled).toBe(false);
        });

        it('should have the main button button disabled if the sneaker size is changed to the same value on blur', async () => {
            await fillAndBlurInput(sizeInput, mockUser.sneaker_size);
            expect(mainButton.props.accessibilityState.disabled).toBe(true);
        });

        it('should display an appropriate error message if the username is not valid on blur', async () => {
            await fillAndBlurInput(userNameInput, 'r');
            expect(errorMessage.props.children).toBe('Username must be at least 4 characters long.');
        });

        it('should display an appropriate error message if the first name is not valid on blur', async () => {
            await fillAndBlurInput(firstNameInput, 'T');
            expect(errorMessage.props.children).toBe('First name must be at least 2 characters long.');
        });

        it('should display an appropriate error message if the last name is not valid on blur', async () => {
            await fillAndBlurInput(lastNameInput, 'T');
            expect(errorMessage.props.children).toBe('Last name must be at least 2 characters long.');
        });

        it('should display an appropriate error message if the sneaker size is not valid on blur', async () => {
            await fillAndBlurInput(sizeInput, '0');
            expect(errorMessage.props.children).toBe('Please enter a valid size, size must be a number between 7 and 15.');
        });

        it('should display a global error message if multiple fields are not valid on blur', async () => {
            await fillAndBlurInput(userNameInput, 'r');
            await fillAndBlurInput(sizeInput, '0');
            expect(errorMessage.props.children).toBe('Please correct the fields in red before continuing');
        });

        it('should set a red border to the username input if the username is not valid on blur', async () => {
            await fillAndBlurInput(userNameInput, 'r');
            expect(userNameInput.props.className).toContain('border-2 border-red-500');
        });

        it('should set a red border to the first name input if the first name is not valid on blur', async () => {
            await fillAndBlurInput(firstNameInput, 'T');
            expect(firstNameInput.props.className).toContain('border-2 border-red-500');
        });

        it('should set a red border to the last name input if the last name is not valid on blur', async () => {
            await fillAndBlurInput(lastNameInput, 'T');
            expect(lastNameInput.props.className).toContain('border-2 border-red-500');
        });

        it('should set a red border to the sneaker size input if the sneaker size is not valid on blur', async () => {
            await fillAndBlurInput(sizeInput, '0');
            expect(sizeInput.props.className).toContain('border-2 border-red-500');
        });
    });

    describe('form focus', () => {
        it('should set a orange border to the username input on focus', async () => {
            await act(async () => {
                fireEvent(userNameInput, 'focus');
            });
            expect(userNameInput.props.className).toContain('border-2 border-orange-500');
        });

        it('should set a orange border to the first name input on focus', async () => {
            await act(async () => {
                fireEvent(firstNameInput, 'focus');
            });
            expect(firstNameInput.props.className).toContain('border-2 border-orange-500');
        });

        it('should set a orange border to the last name input on focus', async () => {
            await act(async () => {
                fireEvent(lastNameInput, 'focus');
            });
            expect(lastNameInput.props.className).toContain('border-2 border-orange-500');
        });
        
        it('should set a orange border to the sneaker size input on focus', async () => {
            await act(async () => {
                fireEvent(sizeInput, 'focus');
            });
            expect(sizeInput.props.className).toContain('border-2 border-orange-500');
        });
    });

    describe('form submit', () => {
        it('should submit the form if a field is changed with a correct value and the main button is pressed', async () => {
            await fillAndBlurInput(userNameInput, 'remysnkr');

            await act(async () => {
                fireEvent.press(mainButton);
            });

            expect(mockUseAuth.updateUser).toHaveBeenCalledWith(
                mockUser.id,
                {
                    username: 'remysnkr',
                    first_name: mockUser.first_name,
                    last_name: mockUser.last_name,
                    sneaker_size: parseInt(mockUser.sneaker_size),
                    profile_picture: mockUser.profile_picture_url,
                },
                'mock-token'
            );
        });
    });
});