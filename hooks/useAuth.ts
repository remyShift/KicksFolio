import { useState } from 'react';
import { SupabaseAuthService } from '@/services/AuthService';
import { router } from 'expo-router';
import { UserData } from '@/types/auth';
import { User } from '@/types/User';
import { useSession } from '@/context/authContext';
import { useSignUpValidation } from './useSignUpValidation';

export const useAuth = () => {
	const [errorMsg, setErrorMsg] = useState('');
	const { setUser, refreshUserData, refreshUserSneakers } = useSession();
	const { validateSignUpStep1 } = useSignUpValidation();

	const login = async (email: string, password: string) => {
		return SupabaseAuthService.signIn(email, password)
			.then((response) => {
				if (response.user) {
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
		return SupabaseAuthService.signUp(userData.email, userData.password, {
			email: userData.email,
			username: userData.username,
			first_name: userData.first_name,
			last_name: userData.last_name,
			sneaker_size: userData.sneaker_size,
		})
			.then((response) => {
				if (response.user) {
					return SupabaseAuthService.signIn(
						userData.email,
						userData.password
					).then((loginResponse) => {
						if (loginResponse.user) {
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
		return SupabaseAuthService.resetPassword(email)
			.then(() => {
				router.replace({
					pathname: '/login',
					params: {
						message:
							'Password reset instructions sent to your email.',
					},
				});
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
		if (newPassword !== confirmNewPassword) {
			setErrorMsg('Passwords do not match');
			return;
		}

		router.replace({
			pathname: '/login',
			params: {
				message: 'Password reset successful.',
			},
		});
	};

	const logout = async () => {
		return SupabaseAuthService.signOut()
			.then(() => {
				router.replace('/login');
				return true;
			})
			.catch((error) => {
				setErrorMsg('Error during logout.');
				return false;
			});
	};

	const clearError = () => {
		setErrorMsg('');
	};

	const verifyToken = async () => {
		return SupabaseAuthService.getCurrentUser()
			.then((user) => {
				return !!user;
			})
			.catch(() => {
				return false;
			});
	};

	const updateUser = async (
		userId: string,
		profileData: Partial<UserData>
	) => {
		return SupabaseAuthService.updateProfile(profileData)
			.then((data) => {
				setUser(data);
				router.replace('/(app)/(tabs)/user');
				return { user: data };
			})
			.catch((error) => {
				setErrorMsg('Error updating profile.');
				return null;
			});
	};

	const deleteAccount = async (userId: string) => {
		setErrorMsg('Account deletion not implemented yet.');
		return false;
	};

	const getUser = async () => {
		return SupabaseAuthService.getCurrentUser()
			.then((user) => {
				return user;
			})
			.catch((error) => {
				setErrorMsg('Error getting user profile.');
				return null;
			});
	};

	const getUserCollection = async (userData: User) => {
		await refreshUserData(userData);
	};

	const getUserSneakers = async (userData: User) => {
		await refreshUserSneakers();
	};

	const handleNextSignupPage = async (
		signUpProps: UserData
	): Promise<string | null> => {
		const validation = await validateSignUpStep1(signUpProps);
		if (!validation.isValid) {
			setErrorMsg(validation.errors[0]);
			return validation.errors[0];
		}
		return null;
	};

	return {
		login,
		signUp,
		forgotPassword,
		resetPassword,
		logout,
		clearError,
		verifyToken,
		updateUser,
		deleteAccount,
		getUser,
		getUserCollection,
		getUserSneakers,
		handleNextSignupPage,
		errorMsg,
	};
};
