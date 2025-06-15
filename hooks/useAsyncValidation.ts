import { AuthValidationService } from '@/services/AuthValidationService';

export function useAsyncValidation() {
	const validationService = new AuthValidationService();

	const checkUsernameExists = async (
		username: string
	): Promise<string | null> => {
		if (!username || username.length < 4) return null;

		return validationService
			.checkUsernameExists(username)
			.then((exists) => {
				return exists ? 'This username is already taken.' : null;
			})
			.catch((error) => {
				console.error('Error checking username:', error);
				return null;
			});
	};

	const checkEmailExists = async (email: string): Promise<string | null> => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) return null;

		return validationService
			.checkEmailExists(email)
			.then((exists) => {
				return exists
					? 'An account with this email already exists, please login.'
					: null;
			})
			.catch((error) => {
				console.error('Error checking email:', error);
				return null;
			});
	};

	return {
		checkUsernameExists,
		checkEmailExists,
	};
}
