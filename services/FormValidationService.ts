import { TextInput } from 'react-native';
import { RefObject } from 'react';
type FieldName =
	| 'username'
	| 'email'
	| 'password'
	| 'confirmPassword'
	| 'firstName'
	| 'lastName'
	| 'size'
	| 'sku';

export class FormValidationService {
	public async validateField(
		value: string,
		inputType: FieldName,
		isLoginPage: boolean = false,
		nextRef: RefObject<TextInput> | null = null,
		password?: string
	): Promise<boolean> {
		let isValid = false;

		if (!value) {
			return true;
		}

		switch (inputType) {
			case 'username':
				isValid = await this.validateUsername(value);
				break;
			case 'email':
				isValid = await this.validateEmail(value, isLoginPage);
				break;
			case 'password':
				isValid = this.validatePassword(value, isLoginPage);
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

			case 'sku':
				isValid = this.validateSku(value);
				break;
		}

		if (isValid && nextRef?.current) {
			nextRef.current.focus();
		}

		return isValid;
	}

	private validateSku(sku: string): boolean {
		if (!sku) {
			return false;
		}
		return true;
	}

	private validatePassword(password: string, isLoginPage: boolean): boolean {
		if (password.length < 8 && !isLoginPage) {
			return false;
		}
		if (!password.match(/^(?=.*[A-Z])(?=.*\d).+$/) && !isLoginPage) {
			return false;
		}

		return true;
	}

	public validateConfirmPassword(
		confirmPassword: string,
		password: string
	): boolean {
		if (confirmPassword !== password) {
			return false;
		}

		return true;
	}

	private async validateUsername(username: string): Promise<boolean> {
		if (username.length < 4) {
			return false;
		}
		if (username.length > 16) {
			return false;
		}
		if (username.match(/[^\w\s]/)) {
			return false;
		}
		if (await this.checkUsernameExists(username)) {
			return false;
		}

		return true;
	}

	private async validateEmail(
		email: string,
		isLoginPage: boolean
	): Promise<boolean> {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			return false;
		}
		if (!isLoginPage) {
			if (await this.checkEmailExists(email)) {
				return false;
			}
		}

		return true;
	}

	private validateSize(size: number): boolean {
		if (size % 0.5 !== 0) {
			return false;
		}
		if (isNaN(size) || size < 1 || size > 15) {
			return false;
		}

		return true;
	}

	private validateName(name: string): boolean {
		if (name.length < 2) {
			return false;
		}
		if (name.match(/[^a-zA-Z\s]/)) {
			return false;
		}

		return true;
	}

	public async checkUsernameExists(username: string): Promise<boolean> {
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

	public async checkEmailExists(email: string): Promise<boolean> {
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
			(user: { email: string }) => user.email === email
		);
	}
}
