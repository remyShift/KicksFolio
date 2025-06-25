import { useState } from 'react';
import { SupabaseAuthService } from '@/services/AuthService';
import { router } from 'expo-router';
import { UserData, UpdateUserData } from '@/types/auth';
import { User } from '@/types/User';
import { useSession } from '@/context/authContext';
import { useSignUpValidation } from './useSignUpValidation';
import SupabaseImageService from '@/services/SupabaseImageService';

export const useAuth = () => {
	const [errorMsg, setErrorMsg] = useState('');
	const { setUser, refreshUserData, refreshUserSneakers, clearUserData } =
		useSession();
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
		const { profile_picture: profilePictureUri, ...restOfUserData } =
			userData;

		try {
			const response = await SupabaseAuthService.signUp(
				restOfUserData.email,
				restOfUserData.password,
				restOfUserData
			);

			if (response.user && profilePictureUri) {
				const uploadResult =
					await SupabaseImageService.uploadProfileImage(
						profilePictureUri,
						response.user.id
					);

				if (uploadResult.success && uploadResult.url) {
					const updatedUser = await SupabaseAuthService.updateProfile(
						response.user.id,
						{ profile_picture: uploadResult.url }
					);
					setUser(updatedUser);
				} else {
					console.error(
						'❌ useAuth.signUp: Failed to upload profile picture:',
						uploadResult.error
					);
				}
			}
			if (response.user) {
				setUser(response.user);
				await login(userData.email, userData.password);
				return true;
			}
			return false;
		} catch (error: any) {
			setErrorMsg(
				error instanceof Error
					? error.message
					: 'An error occurred during sign up'
			);
			return false;
		}
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

	const updateUser = async (
		userId: string,
		profileData: Partial<UpdateUserData>
	) => {
		let newProfileData = { ...profileData };

		return Promise.resolve()
			.then(() => {
				if (
					newProfileData.profile_picture &&
					(newProfileData.profile_picture.startsWith('file://') ||
						newProfileData.profile_picture.startsWith(
							'/private/var/mobile/'
						) ||
						newProfileData.profile_picture.startsWith(
							'/data/user/'
						) ||
						!newProfileData.profile_picture.startsWith('http'))
				) {
					return SupabaseAuthService.getCurrentUser()
						.then((currentUser) => {
							if (currentUser?.profile_picture) {
								const oldFilePath =
									SupabaseImageService.extractFilePathFromUrl(
										currentUser.profile_picture,
										'profiles'
									);

								if (oldFilePath) {
									return SupabaseImageService.deleteImage(
										'profiles',
										oldFilePath
									).then((deleted) => {
										if (!deleted) {
											console.warn(
												'Could not delete old profile picture'
											);
										}
										return deleted;
									});
								}
							}
							return Promise.resolve(true);
						})
						.then(() => {
							return SupabaseImageService.uploadProfileImage(
								newProfileData.profile_picture!,
								userId
							);
						})
						.then((uploadResult) => {
							if (uploadResult.success && uploadResult.url) {
								newProfileData.profile_picture =
									uploadResult.url;
							} else {
								delete newProfileData.profile_picture;
								console.error(
									'❌ useAuth.updateUser: Failed to upload profile picture:',
									uploadResult.error
								);
								throw new Error(
									'Failed to upload profile picture'
								);
							}
						});
				}
			})
			.then(() => {
				return SupabaseAuthService.updateProfile(
					userId,
					newProfileData
				);
			})
			.then((updatedUser) => {
				setUser(updatedUser);
				router.replace('/(app)/(tabs)/user');
				return { user: updatedUser };
			})
			.catch((error) => {
				console.error('❌ useAuth.updateUser: Error occurred:', error);
				setErrorMsg('Error updating profile.');
				throw error;
			});
	};

	const deleteAccount = async (userId: string) => {
		return SupabaseImageService.deleteAllUserFiles(userId)
			.then((filesDeleted) => {
				if (!filesDeleted) {
					console.warn(
						'[useAuth] Some files could not be deleted, but continuing with account deletion'
					);
				}

				return SupabaseAuthService.deleteUser(userId);
			})
			.then(() => {
				clearUserData();
				router.replace('/login');
				return true;
			})
			.catch((error) => {
				throw error;
			});
	};

	const getUser = async () => {
		return SupabaseAuthService.getCurrentUser()
			.then((user) => {
				return user;
			})
			.catch((error) => {
				setErrorMsg(`Error getting user profile: ${error}`);
				return null;
			});
	};

	const getUserCollection = async () => {
		await refreshUserData();
	};

	const getUserSneakers = async () => {
		await refreshUserSneakers();
	};

	const handleNextSignupPage = async (
		signUpProps: UserData
	): Promise<string | null> => {
		const validation = await validateSignUpStep1(signUpProps);
		if (!validation.isValid) {
			setErrorMsg(validation.errorMsg);
			return validation.errorMsg;
		}

		setTimeout(() => {
			router.push('/sign-up-second');
		}, 250);
		return null;
	};

	return {
		login,
		signUp,
		forgotPassword,
		resetPassword,
		logout,
		clearError,
		updateUser,
		deleteAccount,
		getUser,
		getUserCollection,
		getUserSneakers,
		handleNextSignupPage,
		errorMsg,
	};
};
