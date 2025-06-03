import { useForm } from '@/hooks/useForm';
import { useState } from 'react';
import { UserData } from '@/types/auth';

export function useSignUpValidation() {
	const [errorMsg, setErrorMsg] = useState('');

	const { formValidation } = useForm({
		errorSetters: {
			username: (isError: boolean) =>
				setErrorMsg(isError ? 'Username is required' : ''),
			email: (isError: boolean) =>
				setErrorMsg(isError ? 'Email is required' : ''),
			password: (isError: boolean) =>
				setErrorMsg(isError ? 'Password is required' : ''),
			confirmPassword: (isError: boolean) =>
				setErrorMsg(isError ? 'Confirm password is required' : ''),
		},
	});

	async function validateSignUpStep1(values: UserData) {
		const isUsernameValid = await formValidation.validateField(
			values.username,
			'username'
		);
		const isEmailValid = await formValidation.validateField(
			values.email,
			'email'
		);
		const isPasswordValid = await formValidation.validateField(
			values.password,
			'password'
		);
		const isConfirmPasswordValid = await formValidation.validateField(
			values.confirmPassword,
			'confirmPassword',
			false,
			null,
			values.password
		);

		if (
			!isUsernameValid ||
			!isEmailValid ||
			!isPasswordValid ||
			!isConfirmPasswordValid
		) {
			setErrorMsg('Please correct your inputs before continuing');
			return {
				isValid: false,
				errorMsg: 'Please correct your inputs before continuing',
			};
		}
		setErrorMsg('');
		return {
			isValid: true,
			errorMsg: '',
		};
	}

	return {
		validateSignUpStep1,
		errorMsg,
	};
}
