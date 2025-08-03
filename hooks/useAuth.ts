import { useState } from 'react';
import { router } from 'expo-router';
import { UserData, UpdateUserData } from '@/types/auth';
import { useSession } from '@/context/authContext';
import { useValidation } from './useValidation';
import { ImageProvider } from '@/domain/ImageProvider';
import { useTranslation } from 'react-i18next';
import { AuthInterface } from '@/interfaces/AuthInterface';
import { authProvider } from '@/domain/AuthProvider';

export const useAuth = () => {
	const [errorMsg, setErrorMsg] = useState('');
	const { setUser, refreshUserData, clearUserData, resetTokens } =
		useSession();
	const { validateSignUpStep1Async } = useValidation();
	const { t } = useTranslation();

	const login = async (email: string, password: string) => {
		return AuthInterface.signIn(email, password, authProvider.signIn).catch(
			(error) => {
				setErrorMsg(`${t('auth.error.login')} : ${error.message}`);
			}
		);
	};

	const signUp = async (userData: UserData) => {
		const { profile_picture: profilePictureUri, ...restOfUserData } =
			userData;

		return AuthInterface.signUp(
			restOfUserData.email,
			restOfUserData.password,
			restOfUserData,
			authProvider.signUp
		)
			.then((response) => {
				if (response.user && profilePictureUri) {
					return ImageProvider.uploadProfileImage(
						profilePictureUri,
						response.user.id
					).then((uploadResult: any) => {
						if (uploadResult.success && uploadResult.url) {
							return AuthInterface.updateProfile(
								response.user.id,
								{ profile_picture: uploadResult.url },
								authProvider.updateProfile
							).then((updatedUser) => {
								setUser(updatedUser as any);
								return response;
							});
						} else {
							console.error(
								'❌ useAuth.signUp: Failed to upload profile picture:',
								uploadResult.error
							);
							return response;
						}
					});
				}
				return response;
			})
			.then((response) => {
				if (response.user) {
					setUser(response.user);
					return true;
				}
				return false;
			})
			.catch((error) => {
				setErrorMsg(`${t('auth.error.signUp')} : ${error.message}`);
				return false;
			});
	};

	const forgotPassword = async (email: string) => {
		return AuthInterface.forgotPassword(email, authProvider.forgotPassword)
			.then(() => {
				router.replace({
					pathname: '/login',
					params: {
						message: 'email sent',
					},
				});
				return true;
			})
			.catch((error) => {
				setErrorMsg(
					error instanceof Error
						? error.message
						: 'An error occurred during password reset request'
				);
				throw error;
			});
	};

	const resetPassword = async (
		newPassword: string,
		confirmNewPassword: string
	) => {
		if (newPassword !== confirmNewPassword) {
			setErrorMsg(t('auth.error.samePasswordAsOld'));
			return;
		}

		const resetPasswordPromise = resetTokens
			? AuthInterface.resetPasswordWithTokens(
					resetTokens.access_token,
					resetTokens.refresh_token,
					newPassword,
					authProvider.resetPasswordWithTokens
			  )
			: AuthInterface.resetPassword(
					newPassword,
					authProvider.resetPassword
			  );

		return resetPasswordPromise
			.then(() => {
				router.replace({
					pathname: '/login',
					params: {
						message: 'reset successful',
					},
				});
				return true;
			})
			.catch((error) => {
				const errorMessage =
					error instanceof Error
						? error.message
						: t('auth.error.resetPassword');

				if (
					errorMessage.includes(
						'should be different from the old password'
					)
				) {
					setErrorMsg(t('auth.error.samePasswordAsOld'));
				} else if (
					errorMessage.includes('Password should be at least')
				) {
					setErrorMsg(t('auth.form.password.error.size'));
				} else {
					setErrorMsg(errorMessage);
				}
				throw error;
			});
	};

	const logout = async () => {
		return AuthInterface.signOut(authProvider.signOut)
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
					return AuthInterface.getCurrentUser(
						authProvider.getCurrentUser
					)
						.then((currentUser) => {
							if (currentUser?.profile_picture) {
								const oldFilePath =
									ImageProvider.extractFilePathFromUrl(
										currentUser.profile_picture,
										'profiles'
									);

								if (oldFilePath) {
									return ImageProvider.deleteImage(
										'profiles',
										oldFilePath
									).then((deleted: any) => {
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
							return ImageProvider.uploadProfileImage(
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
				return AuthInterface.updateProfile(
					userId,
					newProfileData,
					authProvider.updateProfile
				);
			})
			.then((updatedUser) => {
				setUser(updatedUser as any);
				router.replace('/(app)/(tabs)/profile');
				return { user: updatedUser };
			})
			.catch((error) => {
				console.error('❌ useAuth.updateUser: Error occurred:', error);
				setErrorMsg('Error updating profile.');
				throw error;
			});
	};

	const deleteAccount = async (userId: string) => {
		return ImageProvider.deleteAllUserFiles(userId)
			.then((filesDeleted: any) => {
				if (!filesDeleted) {
					console.warn(
						'[useAuth] Some files could not be deleted, but continuing with account deletion'
					);
				}

				return AuthInterface.deleteUser(
					userId,
					authProvider.deleteUser
				);
			})
			.then(() => {
				clearUserData();
				router.replace('/login');
				return true;
			})
			.catch((error: any) => {
				console.error('❌ Error deleting account:', error);
				throw error;
			});
	};

	const getUser = async () => {
		return AuthInterface.getCurrentUser(authProvider.getCurrentUser)
			.then((user) => {
				return user;
			})
			.catch((error) => {
				setErrorMsg(`Error getting user profile: ${error}`);
				return null;
			});
	};

	const getUserSneakers = async () => {
		await refreshUserData();
	};

	const handleNextSignupPage = async (
		signUpProps: UserData
	): Promise<string | null> => {
		const validation = await validateSignUpStep1Async(signUpProps);
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

		getUserSneakers,
		handleNextSignupPage,
		errorMsg,
	};
};
