import { supabase } from '@/config/supabase/supabase';
import { AuthValidatorInterface } from '@/interfaces/AuthValidatorInterface';

export class AuthValidator implements AuthValidatorInterface {
	async checkUsernameExists(username: string): Promise<boolean> {
		return Promise.resolve(
			supabase.rpc('check_username_availability', {
				username_to_check: username,
			})
		)
			.then(({ data, error }) => {
				if (error) {
					return false;
				}
				return data;
			})
			.catch((error) => {
				console.error('Error in checkUsernameExists:', error);
				return false;
			});
	}

	async checkEmailExists(email: string): Promise<boolean> {
		return Promise.resolve(
			supabase.rpc('check_email_availability', {
				email_to_check: email,
			})
		)
			.then(({ data, error }) => {
				if (error) {
					return false;
				}
				return data;
			})
			.catch((error) => {
				console.error('Error in checkEmailExists:', error);
				return false;
			});
	}
}

export const authValidator = new AuthValidator();
