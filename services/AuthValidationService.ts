import { supabase } from './supabase';

export class AuthValidationService {
	async checkUsernameExists(username: string): Promise<boolean> {
		return Promise.resolve(
			supabase
				.from('users')
				.select('id')
				.eq('username', username)
				.limit(1)
		)
			.then(({ data, error }) => {
				if (error) {
					console.error('Error checking username:', error);
					return false;
				}
				return data && data.length > 0;
			})
			.catch((error: any) => {
				console.error('Error checking username:', error);
				return false;
			});
	}

	async checkEmailExists(email: string): Promise<boolean> {
		return supabase.auth.admin
			.listUsers()
			.then(({ data: authUsers, error: authError }) => {
				if (authError) {
					console.error('Error checking email in auth:', authError);
					return supabase
						.from('users')
						.select('id')
						.eq('email', email)
						.limit(1)
						.then(({ data, error }) => {
							if (error) {
								console.error(
									'Error checking email in users table:',
									error
								);
								return false;
							}
							return data && data.length > 0;
						});
				}

				const emailExists = authUsers.users.some(
					(user) => user.email === email
				);
				return emailExists;
			})
			.catch((error) => {
				console.error('Error checking email:', error);
				return false;
			});
	}
}

export const validationService = new AuthValidationService();
