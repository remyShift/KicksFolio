import { AuthValidator } from '@/domain/AuthValidator';
import { useTranslation } from 'react-i18next';

type ValidationValue = string | number | boolean | null | undefined;

export function useAsyncValidation() {
	const validationService = new AuthValidator();
	const { t } = useTranslation();

	const checkUsernameExists = async (
		username: string
	): Promise<string | null> => {
		if (!username || username.length < 4) return null;

		return validationService
			.checkUsernameExists(username)
			.then((exists) => {
				if (exists) {
					return t('auth.form.username.error.exists');
				}
				return null;
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
				return exists ? t('auth.form.email.error.exists') : null;
			})
			.catch((error) => {
				console.error('Error checking email:', error);
				return null;
			});
	};

	const checkEmailExistsForReset = async (
		value: ValidationValue
	): Promise<string | null> => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!value || !emailRegex.test(value.toString())) return null;

		return validationService
			.checkEmailExists(value.toString())
			.then((exists) => {
				return !exists ? t('auth.form.email.error.notExists') : null;
			})
			.catch((error) => {
				console.error('Error checking email:', error);
				return null;
			});
	};

	return {
		checkUsernameExists,
		checkEmailExists,
		checkEmailExistsForReset,
	};
}
