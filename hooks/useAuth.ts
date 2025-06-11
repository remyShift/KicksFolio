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
		return authService
			.handleLogin(email, password)
			.then((token) => {
				if (token) {
					setSessionToken(token);
					setTimeout(() => {
						router.replace('/(app)/(tabs)');
					}, 500);
				}
			})
			.catch((error) => {
				setErrorMsg(
					error instanceof Error
						? error.message
						: 'An error occurred during login'
				);
			});
	};

	const signUp = async (userData: UserData) => {
		return authService
			.signUp(userData)
			.then(({ user }) => {
				if (user) {
					return authService
						.handleLogin(userData.email, userData.password)
						.then((token) => {
							if (token) {
								setSessionToken(token);
								setUser(user);
								setTimeout(() => {
									router.replace('/collection');
								}, 250);
								return true;
							}
							return false;
						});
				}
				return false;
			})
			.catch((error) => {
				setErrorMsg(
					error instanceof Error
						? error.message
						: 'An error occurred during sign up'
				);
				return false;
			});
	};

	const forgotPassword = async (email: string) => {
		return authService
			.handleForgotPassword(email)
			.then((success) => {
				if (success) {
					router.replace('/login');
				}
			})
			.catch((error) => {
				setErrorMsg(
					error instanceof Error
						? error.message
						: 'An error occurred during password reset request'
				);
			});
	};

	const resetPassword = async (
		token: string,
		newPassword: string,
		confirmNewPassword: string
	) => {
		return authService
			.handleResetPassword(token, newPassword, confirmNewPassword)
			.then((success) => {
				if (success) {
					router.replace('/login');
				}
			})
			.catch((error) => {
				setErrorMsg(
					error instanceof Error
						? error.message
						: 'An error occurred during password reset'
				);
			});
	};

	const logout = async (token: string) => {
		return authService
			.logout(token)
			.then((ok) => {
				if (ok) {
					setSessionToken(null);
					router.replace('/login');
				}
				return ok;
			})
			.catch((error) => {
				setErrorMsg('Error during logout.');
				return false;
			});
	};

	const clearError = () => {
		setErrorMsg('');
	};

	const verifyToken = async (token: string) => {
		return authService
			.verifyToken(token)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				setErrorMsg('Error during token verification.');
				return false;
			});
	};

	const updateUser = async (
		userId: string,
		profileData: Partial<UserData>,
		token: string
	) => {
		return authService
			.updateUser(userId, profileData, token)
			.then((data) => {
				setUser(data.user);
				router.replace('/(app)/(tabs)/user');
				return data;
			})
			.catch((error) => {
				setErrorMsg('Error updating profile.');
				return null;
			});
	};

	const deleteAccount = async (userId: string, token: string) => {
		return authService
			.deleteAccount(userId, token)
			.then(() => {
				setSessionToken(null);
				router.replace('/login');
				return true;
			})
			.catch((error) => {
				setErrorMsg('Error deleting account.');
				return false;
			});
	};

	const getUser = async (token: string) => {
		return authService
			.getUser(token)
			.then((user) => {
				return user;
			})
			.catch((error) => {
				setErrorMsg('Error getting user profile.');
				return null;
			});
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
