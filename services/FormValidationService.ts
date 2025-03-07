import { TextInput } from "react-native";
import { RefObject } from "react";

export class FormValidationService {
    private setErrorMsg: (msg: string) => void;
    private setIsError: (isError: boolean) => void;

    constructor(
        setErrorMsg: (msg: string) => void,
        setIsError: (isError: boolean) => void
    ) {
        this.setErrorMsg = setErrorMsg;
        this.setIsError = setIsError;
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
        inputType: 'username' | 'email' | 'password' | 'firstName' | 'lastName' | 'size',
        isLoginPage: boolean = false,
        nextRef: RefObject<TextInput> | null = null
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
            case 'size':
                isValid = this.validateSize(Number(value));
                break;
        }

        if (isValid && nextRef?.current) {
            nextRef.current.focus();
        }

        return isValid;
    }

    private validatePassword(password: string): boolean {
        if (!password) {
            this.setErrorMsg('Please put your password.');
            this.setIsError(true);
            return false;
        }
        if (password.length < 8) {
            this.setErrorMsg('Password must be at least 8 characters long.');
            this.setIsError(true);
            return false;
        }
        if (!password.match(/^(?=.*[A-Z])(?=.*\d).+$/)) {
            this.setErrorMsg('Password must contain at least one uppercase letter and one number.');
            this.setIsError(true);
            return false;
        }
        
        this.clearErrors();
        return true;
    }

    public validateConfirmPassword(confirmPassword: string, password: string): boolean {
        if (!confirmPassword) {
            this.setErrorMsg('Please confirm your password.');
            this.setIsError(true);
            return false;
        }
        if (confirmPassword !== password) {
            this.setErrorMsg('Passwords do not match.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    private async validateUsername(username: string): Promise<boolean> {
        if (!username) {
            this.setErrorMsg('Please put your username.');
            this.setIsError(true);
            return false;
        }
        if (username.length < 4) {
            this.setErrorMsg('Username must be at least 4 characters long.');
            this.setIsError(true);
            return false;
        }
        if (username.length > 16) {
            this.setErrorMsg('Username must be less than 16 characters.');
            this.setIsError(true);
            return false;
        }
        if (username.match(/[^\w\s]/)) {
            this.setErrorMsg('Username must not contain special characters.');
            this.setIsError(true);
            return false;
        }
        if (await this.checkUsernameExists(username)) {
            this.setErrorMsg('This username is already taken.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    private async validateEmail(email: string, isLoginPage: boolean): Promise<boolean> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            this.setErrorMsg('Please put your email.');
            this.setIsError(true);
            return false;
        }
        if (!emailRegex.test(email)) {
            this.setErrorMsg('Please put a valid email.');
            this.setIsError(true);
            return false;
        }
        if (await this.checkEmailExists(email) && !isLoginPage) {
            this.setErrorMsg('This email is already taken.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    private validateSize(size: number): boolean {
        if (!size) {
            this.setErrorMsg('Please put your size.');
            this.setIsError(true);
            return false;
        }
        if (size % 0.5 !== 0) {
            this.setErrorMsg('Size must be a multiple of 0.5.');
            this.setIsError(true);
            return false;
        }
        if (isNaN(size) || size < 1 || size > 15) {
            this.setErrorMsg('Please put a valid size between 1 and 15.');
            this.setIsError(true);
            return false;
        }

        this.clearErrors();
        return true;
    }

    private validateName(name: string): boolean {
        if (!name) {
            this.setErrorMsg('Please put your name.');
            this.setIsError(true);
            return false;
        }
        if (name.length < 2) {
            this.setErrorMsg('Name must be at least 2 characters long.');
            this.setIsError(true);
            return false;
        }
        if (name.match(/[^a-zA-Z\s]/)) {
            this.setErrorMsg('Name must not contain special characters or numbers.');
            this.setIsError(true);
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
        this.setIsError(false);
    }
} 