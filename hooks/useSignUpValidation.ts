import { useState } from 'react';
import { UserData } from '@/types/auth';
import { useAsyncValidation } from './useAsyncValidation';

export function useSignUpValidation() {
	const [errorMsg, setErrorMsg] = useState('');
	const { checkUsernameExists, checkEmailExists } = useAsyncValidation();

	async function validateSignUpStep1Async(values: UserData) {
		try {
			const usernameError = await checkUsernameExists(values.username);
			if (usernameError) {
				setErrorMsg(usernameError);
				return {
					isValid: false,
					errorMsg: usernameError,
				};
			}

			const emailError = await checkEmailExists(values.email);
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
		validateSignUpStep1Async,
		errorMsg,
	};
}
