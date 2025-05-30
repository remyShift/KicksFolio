import { TextInput } from 'react-native';
import { RefObject } from 'react';
import { FieldName } from './FormService';

type ErrorSetters = {
	[key: string]: (isError: boolean) => void;
};

export class FormValidationService {
	private setErrorMsg: (msg: string) => void;
	private errorSetters: ErrorSetters;

	constructor(
		setErrorMsg: (msg: string) => void,
		errorSetters: ErrorSetters
	) {
		this.setErrorMsg = setErrorMsg;
		this.errorSetters = errorSetters;
	}

	public async validateField(
		value: string,
		inputType: FieldName,
		isLoginPage: boolean = false,
		nextRef: RefObject<TextInput> | null = null,
		password?: string
	): Promise<boolean> {
		console.log('validateField function called');
		let isValid = false;

		switch (inputType) {
			case 'username':
				isValid = await this.validateUsername(value);
				break;
			case 'email':
				console.log('email inputType');
				isValid = await this.validateEmail(value, isLoginPage);
				break;
			case 'password':
				console.log('password inputType');
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

		if (!isValid && this.errorSetters[inputType]) {
			this.errorSetters[inputType](true);
		} else if (isValid && this.errorSetters[inputType]) {
			this.errorSetters[inputType](false);
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
			this.setErrorMsg(
				'Password must contain at least one uppercase letter and one number.'
			);
			return false;
		}

		this.clearErrors();
		return true;
	}

	public validateConfirmPassword(
		confirmPassword: string,
		password: string
	): boolean {
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

	private async validateEmail(
		email: string,
		isLoginPage: boolean
	): Promise<boolean> {
		console.log('validateEmail function called ', email);
		console.log('isLoginPage', isLoginPage);
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!email) {
			this.setErrorMsg('Please put your email.');
			return false;
		}
		if (!emailRegex.test(email)) {
			this.setErrorMsg('Please put a valid email.');
			return false;
		}
		if (!isLoginPage) {
			if (await this.checkEmailExists(email)) {
				this.setErrorMsg('This email is already taken.');
				return false;
			}
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
			this.setErrorMsg(
				'Name must not contain special characters or numbers.'
			);
			return false;
		}

		this.clearErrors();
		return true;
	}

	private async checkUsernameExists(username: string): Promise<boolean> {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_BASE_API_URL}/users`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) return false;

		const data = await response.json();
		return data.users.some(
			(user: { username: string }) => user.username === username
		);
	}

	private async checkEmailExists(email: string): Promise<boolean> {
		console.log('checkEmailExists function called ', email);
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_BASE_API_URL}/users`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		console.log('response', response);

		if (!response.ok) return false;
		const data = await response.json();
		return data.users.some(
			(user: { email: string }) => user.email === email
		);
	}

	public clearErrors(): void {
		this.setErrorMsg('');
		Object.values(this.errorSetters).forEach((setter) => setter(false));
	}

	public setErrorMessage(msg: string): void {
		this.setErrorMsg(msg);
	}
}
