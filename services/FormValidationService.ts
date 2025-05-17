import { TextInput, ScrollView } from "react-native";
import { RefObject } from "react";

type ErrorSetters = {
    [key: string]: (isError: boolean) => void;
};

type FocusSetters = {
    [key: string]: (isFocused: boolean) => void;
};

export class FormValidationService {
    private setErrorMsg: (msg: string) => void;
    private errorSetters: ErrorSetters;
    private focusSetters: FocusSetters;
    private scrollViewRef: RefObject<ScrollView> | null;

    constructor(
        setErrorMsg: (msg: string) => void,
        errorSetters: ErrorSetters,
        focusSetters?: FocusSetters,
        scrollViewRef?: RefObject<ScrollView>
    ) {
        this.setErrorMsg = setErrorMsg;
        this.errorSetters = errorSetters;
        this.focusSetters = focusSetters || {};
        this.scrollViewRef = scrollViewRef || null;
    }

    public handleInputFocus(inputType: string): void {
        if (this.focusSetters[inputType]) {
            this.focusSetters[inputType](true);
        }
        this.setErrorMsg('');
        this.scrollToBottom();
    }

    public handleInputBlur(inputType: string, value: string, validationType?: string): void {
        if (this.focusSetters[inputType]) {
            this.focusSetters[inputType](false);
        }
        if (validationType) {
            this.validateField(value, validationType as any, inputType);
        }
    }

    private scrollToBottom(): void {
        if (this.scrollViewRef?.current) {
            this.scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }

    public handleInputChange(
        text: string, 
        setter: (text: string) => void
    ): void {
        setter(text);
        this.setErrorMsg('');
    }

    public async validateField(
        value: string,
        inputType: 'username' | 'email' | 'password' | 'firstName' | 'lastName' | 'size' | 'confirmPassword',
        fieldName: string,
        isLoginPage: boolean = false,
        nextRef: RefObject<TextInput> | null = null,
        password?: string
    ): Promise<boolean> {
        let isValid = false;
        
        switch (inputType) {
            case 'username':
                isValid = await this.validateUsername(value);
                break;
            case 'email':
                isValid = await this.validateEmail(value, isLoginPage);
                break;
            case 'password':
                isValid = this.validatePassword(value);
                break;
            case 'firstName':
            case 'lastName':
                isValid = this.validateName(value);
                break;
            case 'confirmPassword':
                if (!password) {
                    throw new Error('Password is required');
                }
                isValid = this.validateConfirmPassword(value, password);
                break;
            case 'size':
                isValid = this.validateSize(Number(value));
                break;
        }

        if (!isValid && this.errorSetters[fieldName]) {
            this.errorSetters[fieldName](true);
        } else if (isValid && this.errorSetters[fieldName]) {
            this.errorSetters[fieldName](false);
        }

        if (isValid && nextRef?.current) {
            nextRef.current.focus();
        }

        return isValid;
    }

    private validatePassword(password: string): boolean {
        if (!password) {
            this.setErrorMsg('Please put your password.');
            return false;
        }
        if (password.length < 8) {
            this.setErrorMsg('Password must be at least 8 characters long.');
            return false;
        }
        if (!password.match(/^(?=.*[A-Z])(?=.*\d).+$/)) {
            this.setErrorMsg('Password must contain at least one uppercase letter and one number.');
            return false;
        }
        
        this.clearErrors();
        return true;
    }

    public validateConfirmPassword(confirmPassword: string, password: string): boolean {
        if (!confirmPassword) {
            this.setErrorMsg('Please confirm your password.');
            return false;
        }
        if (confirmPassword !== password) {
            this.setErrorMsg('Passwords do not match.');
            return false;
        }

        this.clearErrors();
        return true;
    }

    private async validateUsername(username: string): Promise<boolean> {
        if (!username) {
            this.setErrorMsg('Please put your username.');
            return false;
        }
        if (username.length < 4) {
            this.setErrorMsg('Username must be at least 4 characters long.');
            return false;
        }
        if (username.length > 16) {
            this.setErrorMsg('Username must be less than 16 characters.');
            return false;
        }
        if (username.match(/[^\w\s]/)) {
            this.setErrorMsg('Username must not contain special characters.');
            return false;
        }
        if (await this.checkUsernameExists(username)) {
            this.setErrorMsg('This username is already taken.');
            return false;
        }

        this.clearErrors();
        return true;
    }

    private async validateEmail(email: string, isLoginPage: boolean): Promise<boolean> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            this.setErrorMsg('Please put your email.');
            return false;
        }
        if (!emailRegex.test(email)) {
            this.setErrorMsg('Please put a valid email.');
            return false;
        }
        if (await this.checkEmailExists(email) && !isLoginPage) {
            this.setErrorMsg('This email is already taken.');
            return false;
        }

        this.clearErrors();
        return true;
    }

    private validateSize(size: number): boolean {
        if (!size) {
            this.setErrorMsg('Please put your size.');
            return false;
        }
        if (size % 0.5 !== 0) {
            this.setErrorMsg('Size must be a multiple of 0.5.');
            return false;
        }
        if (isNaN(size) || size < 1 || size > 15) {
            this.setErrorMsg('Please put a valid size between 1 and 15.');
            return false;
        }

        this.clearErrors();
        return true;
    }

    private validateName(name: string): boolean {
        if (!name) {
            this.setErrorMsg('Please put your name.');
            return false;
        }
        if (name.length < 2) {
            this.setErrorMsg('Name must be at least 2 characters long.');
            return false;
        }
        if (name.match(/[^a-zA-Z\s]/)) {
            this.setErrorMsg('Name must not contain special characters or numbers.');
            return false;
        }

        this.clearErrors();
        return true;
    }

    private async checkUsernameExists(username: string): Promise<boolean> {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) return false;
        
        const data = await response.json();
        return data.users.some((user: { username: string }) => user.username === username);
    }

    private async checkEmailExists(email: string): Promise<boolean> {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return false;

        const data = await response.json();
        return data.users.some((user: { email: string }) => user.email === email);
    }

    private clearErrors(): void {
        this.setErrorMsg('');
        Object.values(this.errorSetters).forEach(setter => setter(false));
    }
} 