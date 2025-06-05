import { useState } from 'react';
import { AuthService } from '@/services/AuthService';
import { FormValidationService } from '@/services/FormValidationService';
import { router } from 'expo-router';
import { UserData } from '@/types/auth';
import { User } from '@/types/User';
import { collectionService } from '@/services/CollectionService';
import { SneakersService } from '@/services/SneakersService';
import { useSession } from '@/context/authContext';
import { useSignUpValidation } from './useSignUpValidation';

export const useAuth = () => {
	const [errorMsg, setErrorMsg] = useState('');
	const authService = new AuthService();
	const formValidation = new FormValidationService(setErrorMsg, {});
	const { setSessionToken, setUserCollection, setUserSneakers } =
		useSession();
	const { validateSignUpStep1 } = useSignUpValidation();

	const login = async (email: string, password: string) => {
		const token = await authService.handleLogin(
			email,
			password,
			formValidation
		);

		if (token) {
			setSessionToken(token);
			setTimeout(() => {
				router.replace('/(app)/(tabs)');
			}, 500);
		}
	};

	const signUp = async (
		userData: UserData,
		setSignUpProps: (props: any) => void
	) => {
		const success = await authService.handleSignUp(
			userData,
			formValidation,
			setSignUpProps
		);
		if (success) {
			const token = await authService.handleLogin(
				userData.email,
				userData.password,
				formValidation
			);
			if (token) {
				setSessionToken(token);
				const user = await getUser(token);
				if (user) {
					setTimeout(() => {
						router.replace('/collection');
					}, 250);
				}
			}
		}
	};

	const forgotPassword = async (email: string) => {
		const success = await authService.handleForgotPassword(
			email,
			formValidation
		);
		if (success) {
			router.replace('/login');
		}
	};

	const resetPassword = async (
		token: string,
		newPassword: string,
		confirmNewPassword: string
	) => {
		const success = await authService.handleResetPassword(
			token,
			newPassword,
			confirmNewPassword,
			formValidation
		);
		if (success) {
			router.replace('/login');
		}
	};

	const logout = async (token: string) => {
		return authService
			.logout(token)
			.then((ok) => {
				if (ok) {
					setSessionToken(null);
					setUserCollection(null);
					router.replace('/login');
				}
				return ok;
			})
			.catch(() => {
				setErrorMsg('Erreur lors de la déconnexion.');
				return false;
			});
	};

	const verifyToken = async (token: string) => {
		return authService
			.verifyToken(token)
			.then((isValid) => isValid)
			.catch(() => {
				setErrorMsg('Erreur lors de la vérification du token.');
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
				router.replace('/(app)/(tabs)/user');
				return data;
			})
			.catch(() => {
				setErrorMsg('Erreur lors de la mise à jour du profil.');
				return null;
			});
	};

	const deleteAccount = async (userId: string, token: string) => {
		return authService
			.deleteAccount(userId, token)
			.then(() => {
				router.replace('/login');
				return true;
			})
			.catch(() => {
				setErrorMsg('Error when deleting account.');
				return false;
			});
	};

	const getUser = async (token: string) => {
		return authService
			.getUser(token)
			.then((data) => data)
			.catch(() => {
				setErrorMsg('Error when getting user profile.');
				return null;
			});
	};

	const getUserCollection = async (user: User, token: string) => {
		return collectionService
			.getUserCollection(user.id, token)
			.then((data) => {
				setUserCollection(data.collection);
				return data;
			})
			.catch(() => {
				setErrorMsg('Error when getting user collection.');
				return null;
			});
	};

	const getUserSneakers = async (user: User, token: string) => {
		const sneakerService = new SneakersService(user.id, token);
		return sneakerService
			.getUserSneakers()
			.then((data) => {
				console.log('data', data);
				setUserSneakers(data.sneakers);
				console.log('toto');
				return data;
			})
			.catch(() => {
				setErrorMsg('Error when getting user sneakers.');
				return null;
			});
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
		formValidation,
	};
};
