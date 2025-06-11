import { useState } from 'react';
import { UserData } from '@/types/auth';
import { useAsyncValidation } from './useAsyncValidation';

export function useSignUpValidation() {
	const [errorMsg, setErrorMsg] = useState('');
	const { checkUsernameExists, checkEmailExists } = useAsyncValidation();

	async function validateSignUpStep1(values: UserData) {
		return checkUsernameExists(values.username)
			.then((usernameError) => {
				if (usernameError) {
					setErrorMsg(usernameError);
					return Promise.reject({
						isValid: false,
						errorMsg: usernameError,
					});
				}
				return checkEmailExists(values.email);
			})
			.then((emailError) => {
				if (emailError) {
					setErrorMsg(emailError);
					return Promise.reject({
						isValid: false,
						errorMsg: emailError,
					});
				}

				if (!values.password || values.password.length < 8) {
					const error =
						'Password must be at least 8 characters long.';
					setErrorMsg(error);
					return Promise.reject({
						isValid: false,
						errorMsg: error,
					});
				}

				if (values.password !== values.confirmPassword) {
					const error = "Passwords don't match";
					setErrorMsg(error);
					return Promise.reject({
						isValid: false,
						errorMsg: error,
					});
				}

				setErrorMsg('');
				return {
					isValid: true,
					errorMsg: '',
				};
			})
			.catch((error) => {
				if (error.isValid !== undefined) {
					return error;
				}
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
	}

	return {
		validateSignUpStep1,
		errorMsg,
	};
}
