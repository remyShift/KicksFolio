import { useState } from 'react';
import { UserData } from '@/types/auth';
import { useAsyncValidation } from './useAsyncValidation';

export function useSignUpValidation() {
	const [errorMsg, setErrorMsg] = useState('');
	const { checkUsernameExists, checkEmailExists } = useAsyncValidation();

	async function validateSignUpStep1(values: UserData) {
		try {
			// Vérifier le nom d'utilisateur
			const usernameError = await checkUsernameExists(values.username);
			if (usernameError) {
				setErrorMsg(usernameError);
				return {
					isValid: false,
					errorMsg: usernameError,
				};
			}

			// Vérifier l'email
			const emailError = await checkEmailExists(values.email);
			if (emailError) {
				setErrorMsg(emailError);
				return {
					isValid: false,
					errorMsg: emailError,
				};
			}

			// Vérifier le mot de passe
			if (!values.password || values.password.length < 8) {
				const error = 'Password must be at least 8 characters long.';
				setErrorMsg(error);
				return {
					isValid: false,
					errorMsg: error,
				};
			}

			// Vérifier la confirmation du mot de passe
			if (values.password !== values.confirmPassword) {
				const error = "Passwords don't match";
				setErrorMsg(error);
				return {
					isValid: false,
					errorMsg: error,
				};
			}

			setErrorMsg('');
			return {
				isValid: true,
				errorMsg: '',
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'An error occurred during validation';
			setErrorMsg(errorMessage);
			return {
				isValid: false,
				errorMsg: errorMessage,
			};
		}
	}

	return {
		validateSignUpStep1,
		errorMsg,
	};
}
