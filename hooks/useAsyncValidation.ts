import { AuthValidationService } from '@/services/AuthValidationService';
import { useSession } from '@/context/authContext';

export function useAsyncValidation() {
	const validationService = new AuthValidationService();
	const { userSneakers } = useSession();

	const checkUsernameExists = async (
		username: string
	): Promise<string | null> => {
		if (!username || username.length < 4) return null;

		try {
			const exists = await validationService.checkUsernameExists(
				username
			);
			return exists ? 'This username is already taken.' : null;
		} catch (error) {
			console.error('Error checking username:', error);
			return null;
		}
	};

	const checkEmailExists = async (email: string): Promise<string | null> => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) return null;

		try {
			const exists = await validationService.checkEmailExists(email);
			return exists
				? 'An account with this email already exists, please login.'
				: null;
		} catch (error) {
			console.error('Error checking email:', error);
			return null;
		}
	};

	return {
		checkUsernameExists,
		checkEmailExists,
	};
}
