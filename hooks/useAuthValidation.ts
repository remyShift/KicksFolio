import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserData } from '@/types/auth';
import { AuthValidatorInterface } from '@/interfaces/AuthValidatorInterface';
import { authValidator } from '@/domain/AuthValidator';

type ValidationValue = string | number | boolean | null | undefined;

export function useAuthValidation() {
	const [errorMsg, setErrorMsg] = useState('');
	const { t } = useTranslation();

	const checkUsernameExists = async (
		username: string
	): Promise<string | null> => {
		if (!username || username.length < 4) return null;

		return AuthValidatorInterface.checkUsernameExists(
			username,
			authValidator.checkUsernameExists
		)
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

		return AuthValidatorInterface.checkEmailExists(
			value.toString(),
			authValidator.checkEmailExists
		)
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

		return AuthValidatorInterface.checkEmailExists(
			value.toString(),
			authValidator.checkEmailExists
		)
			.then((exists) => {
				return !exists ? t('auth.form.email.error.notExists') : null;
			})
			.catch((error) => {
				console.error('Error checking email:', error);
				return null;
			});
	};

	const validateSignUpStep1Async = async (values: UserData) => {
		return checkUsernameExists(values.username)
			.then((usernameError) => {
				if (usernameError) {
					setErrorMsg(usernameError);
					return {
						isValid: false,
						errorMsg: usernameError,
					};
				}

				return checkEmailExists(values.email).then((emailError) => {
					if (emailError) {
						setErrorMsg(emailError);
						return {
							isValid: false,
							errorMsg: emailError,
						};
					}

					setErrorMsg('');
					return {
						isValid: true,
						errorMsg: '',
					};
				});
			})
			.catch((error) => {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'An error occurred during validation';
				setErrorMsg(errorMessage);
				return {
					isValid: false,
					errorMsg: errorMessage,
				};
			});
	};

	return {
		checkUsernameExists,
		checkEmailExists,
		checkEmailExistsForReset,
		validateSignUpStep1Async,
		errorMsg,
		setErrorMsg,
	};
}
