import { BaseApiService } from './BaseApiService';

export class AuthValidationService extends BaseApiService {
	async checkUsernameExists(username: string): Promise<boolean> {
		const response = await fetch(`${this.baseUrl}/users`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) return false;

		const data = await response.json();
		return data.users.some(
			(user: { username: string }) => user.username === username
		);
	}

	async checkEmailExists(email: string): Promise<boolean> {
		const response = await fetch(`${this.baseUrl}/users`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) return false;

		const data = await response.json();
		return data.users.some(
			(user: { email: string }) => user.email === email
		);
	}
}

export const validationService = new AuthValidationService();
