import { AuthValidationService } from '@/services/AuthValidationService';

type ValidationValue = string | number | boolean | null | undefined;

export function useAsyncValidation() {
	const validationService = new AuthValidationService();

	const checkUsernameExists = async (
		value: ValidationValue
	): Promise<string | null> => {
		if (!value || value.toString().length < 4) return null;

		return validationService
			.checkUsernameExists(value.toString())
			.then((exists) => {
				return exists ? 'This username is already taken.' : null;
			})
			.catch((error) => {
				console.error('Error checking username:', error);
				return null;
			});
	};

	const checkEmailExists = async (
		value: ValidationValue
	): Promise<string | null> => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!value || !emailRegex.test(value.toString())) return null;

		return validationService
			.checkEmailExists(value.toString())
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
