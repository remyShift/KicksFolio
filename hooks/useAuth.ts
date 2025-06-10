import { useState } from 'react';
import { AuthService } from '@/services/AuthService';
import { router } from 'expo-router';
import { UserData } from '@/types/auth';
import { User } from '@/types/User';
import { useSession } from '@/context/authContext';
import { useSignUpValidation } from './useSignUpValidation';

export const useAuth = () => {
	const [errorMsg, setErrorMsg] = useState('');
	const authService = new AuthService();
	const { setSessionToken, refreshUserData, refreshUserSneakers, setUser } =
		useSession();
	const { validateSignUpStep1 } = useSignUpValidation();

	const login = async (email: string, password: string) => {
		try {
			const token = await authService.handleLogin(email, password);
			if (token) {
				setSessionToken(token);
				setTimeout(() => {
					router.replace('/(app)/(tabs)');
				}, 500);
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred during login'
			);
		}
	};

	const signUp = async (userData: UserData) => {
		try {
			const { user } = await authService.signUp(userData);
			if (user) {
				const token = await authService.handleLogin(
					userData.email,
					userData.password
				);
				if (token) {
					setSessionToken(token);
					setTimeout(() => {
						router.replace('/collection');
					}, 250);
					return true;
				}
			}
			return false;
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred during sign up'
			);
			return false;
		}
	};

	const forgotPassword = async (email: string) => {
		try {
			const success = await authService.handleForgotPassword(email);
			if (success) {
				router.replace('/login');
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred during password reset request'
			);
		}
	};

	const resetPassword = async (
		token: string,
		newPassword: string,
		confirmNewPassword: string
	) => {
		try {
			const success = await authService.handleResetPassword(
				token,
				newPassword,
				confirmNewPassword
			);
			if (success) {
				router.replace('/login');
			}
		} catch (error) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred during password reset'
			);
		}
	};

	const logout = async (token: string) => {
		try {
			const ok = await authService.logout(token);
			if (ok) {
				setSessionToken(null);
				router.replace('/login');
			}
			return ok;
		} catch (error) {
			setErrorMsg('Error during logout.');
			return false;
		}
	};

	const clearError = () => {
		setErrorMsg('');
	};

	const verifyToken = async (token: string) => {
		try {
			return await authService.verifyToken(token);
		} catch (error) {
			setErrorMsg('Error during token verification.');
			return false;
		}
	};

	const updateUser = async (
		userId: string,
		profileData: Partial<UserData>,
		token: string
	) => {
		try {
			const data = await authService.updateUser(
				userId,
				profileData,
				token
			);
			setUser(data.user);
			router.replace('/(app)/(tabs)/user');
			return data;
		} catch (error) {
			setErrorMsg('Error updating profile.');
			return null;
		}
	};

	const deleteAccount = async (userId: string, token: string) => {
		try {
			await authService.deleteAccount(userId, token);
			setSessionToken(null);
			router.replace('/login');
			return true;
		} catch (error) {
			setErrorMsg('Error deleting account.');
			return false;
		}
	};

	const getUser = async (token: string) => {
		try {
			return await authService.getUser(token);
		} catch (error) {
			setErrorMsg('Error getting user profile.');
			return null;
		}
	};

	const getUserCollection = async (userData: User, token: string) => {
		await refreshUserData(userData, token);
	};

	const getUserSneakers = async (userData: User, token: string) => {
		await refreshUserSneakers();
	};

	const handleNextSignupPage = async (
		signUpProps: UserData
	): Promise<string | null> => {
		const result = await validateSignUpStep1(signUpProps);

		if (!result.isValid) {
			return result.errorMsg;
		} else {
			setTimeout(() => {
				router.replace('/sign-up-second');
			}, 250);
			return null;
		}
	};

	return {
		errorMsg,
		clearError,
		login,
		signUp,
		forgotPassword,
		resetPassword,
		logout,
		verifyToken,
		updateUser,
		deleteAccount,
		getUser,
		getUserCollection,
		getUserSneakers,
		handleNextSignupPage,
	};
};
