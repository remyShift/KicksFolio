import { BaseApiService } from '@/services/BaseApiService';
import { User } from '@/types/User';
import { UserData } from '@/types/auth';

interface LoginResponse {
	user: User;
	token: string;
}

export class AuthService extends BaseApiService {
	async handleLogin(email: string, password: string): Promise<string> {
		if (!email || !password) {
			throw new Error('Email and password are required');
		}

		return this.login(email, password)
			.then((res) => {
				return res.token;
			})
			.catch(() => {
				throw new Error('Email or password incorrect');
			});
	}

	async login(email: string, password: string): Promise<LoginResponse> {
		const response = await fetch(`${this.baseUrl}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...this.getAuthHeaders(),
			},
			body: JSON.stringify({ authentication: { email, password } }),
		});

		return this.handleResponse(response);
	}

	async getUser(token: string): Promise<{ user: User }> {
		const response = await fetch(`${this.baseUrl}/users/me`, {
			headers: this.getAuthHeaders(token),
		});

		return this.handleResponse(response);
	}

	async signUp(userData: UserData): Promise<{ user: User }> {
		const formData = new FormData();

		formData.append('user[email]', userData.email);
		formData.append('user[password]', userData.password);
		formData.append('user[username]', userData.username);
		formData.append('user[first_name]', userData.first_name);
		formData.append('user[last_name]', userData.last_name);
		formData.append('user[sneaker_size]', userData.sneaker_size.toString());

		if (userData.profile_picture) {
			const imageUriParts = userData.profile_picture.split('.');
			const fileType = imageUriParts[imageUriParts.length - 1];

			formData.append('user[profile_picture]', {
				uri: userData.profile_picture,
				type: 'image/jpeg',
				name: `profile_picture.${fileType}`,
			} as any);
		}

		const response = await fetch(`${this.baseUrl}/users`, {
			method: 'POST',
			headers: this.getAuthHeaders(),
			body: formData,
		});

		return this.handleResponse(response);
	}

	async logout(token: string): Promise<boolean> {
		const response = await fetch(`${this.baseUrl}/logout`, {
			method: 'DELETE',
			headers: this.getAuthHeaders(token),
		});

		return response.ok;
	}

	async verifyToken(token: string): Promise<boolean> {
		const response = await fetch(`${this.baseUrl}/verify_token`, {
			method: 'POST',
			headers: this.getAuthHeaders(token),
		});

		if (!response.ok) return false;
		const data = await response.json();
		return data.valid;
	}

	async updateUser(
		userId: string,
		profileData: Partial<UserData>,
		token: string
	): Promise<{ user: User }> {
		const formData = new FormData();

		Object.entries(profileData).forEach(([key, value]) => {
			if (key !== 'profile_picture' && value) {
				formData.append(
					`user[${key.replace('new', '').toLowerCase()}]`,
					value.toString()
				);
			}
		});

		if (profileData.profile_picture) {
			const imageUriParts = profileData.profile_picture.split('.');
			const fileType = imageUriParts[imageUriParts.length - 1];

			formData.append('user[profile_picture]', {
				uri: profileData.profile_picture,
				type: 'image/jpeg',
				name: `profile_picture.${fileType}`,
			} as any);
		}

		const response = await fetch(`${this.baseUrl}/users/${userId}`, {
			method: 'PATCH',
			headers: this.getAuthHeaders(token),
			body: formData,
		});

		return this.handleResponse(response);
	}

	async handleResetPassword(
		token: string,
		newPassword: string,
		confirmPassword: string
	): Promise<boolean> {
		if (!newPassword || !confirmPassword) {
			throw new Error('New password and confirmation are required');
		}

		if (newPassword !== confirmPassword) {
			throw new Error('Passwords do not match');
		}

		return this.resetPassword(token, newPassword)
			.then(() => {
				return true;
			})
			.catch(() => {
				throw new Error(
					'An error occurred while resetting your password'
				);
			});
	}

	private async resetPassword(
		token: string,
		newPassword: string
	): Promise<string> {
		const response = await fetch(`${this.baseUrl}/passwords/reset`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: token,
				password: newPassword,
			}),
		});

		const data = await response.json();
		if (data.error) {
			throw new Error(data.error);
		}

		return data.message;
	}

	async deleteAccount(
		userId: string,
		token: string
	): Promise<{ message: string }> {
		const response = await fetch(`${this.baseUrl}/users/${userId}`, {
			method: 'DELETE',
			headers: this.getAuthHeaders(token),
		});

		return this.handleResponse(response);
	}

	async handleForgotPassword(email: string): Promise<boolean> {
		if (!email) {
			throw new Error('Email is required');
		}

		return this.forgotPassword(email)
			.then(() => {
				return true;
			})
			.catch(() => {
				throw new Error(
					'An error occurred while processing your request'
				);
			});
	}

	private async forgotPassword(email: string): Promise<string> {
		const response = await fetch(`${this.baseUrl}/passwords/forgot`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		const data = await response.json();
		if (data.error) {
			throw new Error(data.error);
		}

		return data.message;
	}
}

export const authService = new AuthService();
