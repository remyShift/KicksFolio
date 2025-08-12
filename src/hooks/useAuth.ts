import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { useSession } from '@/contexts/authContext';
import { Auth } from '@/domain/Auth';
import { ImageStorage } from '@/domain/ImageStorage';
import { authProxy } from '@/tech/proxy/AuthProxy';
import { imageStorageProxy } from '@/tech/proxy/ImageProxy';
import { UpdateUserData, UserData } from '@/types/auth';

import { useAuthValidation } from './useAuthValidation';

export const useAuth = () => {
	const [errorMsg, setErrorMsg] = useState('');
	const { setUser, clearUserData, resetTokens } = useSession();
	const { validateSignUpStep1Async } = useAuthValidation();
	const { t } = useTranslation();

	const auth = new Auth(authProxy);
	const imageHandler = new ImageStorage(imageStorageProxy);

	const login = async (email: string, password: string) => {
		return auth.signIn(email, password).catch((error) => {
			setErrorMsg(`${t('auth.error.login')} : ${error.message}`);
		});
	};

	const signUp = async (userData: UserData) => {
		const { profile_picture: profilePictureUri, ...restOfUserData } =
			userData;

		return auth
			.signUp(
				restOfUserData.email,
				restOfUserData.password,
				restOfUserData
			)
			.then((response) => {
				if (response.user && profilePictureUri) {
					return imageHandler
						.uploadProfile(profilePictureUri, response.user.id)
						.then((uploadResult) => {
							if (uploadResult.success && uploadResult.url) {
								return auth
									.updateProfile(response.user.id, {
										profile_picture: uploadResult.url,
									})
									.then((updatedUser) => {
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
		return auth
			.forgotPassword(email)
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
			? auth.resetPasswordWithTokens(
					resetTokens.access_token,
					resetTokens.refresh_token,
					newPassword
				)
			: auth.resetPassword(newPassword);

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
		return auth
			.signOut()
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
					return auth
						.getCurrentUser()
						.then((currentUser) => {
							if (currentUser?.profile_picture) {
								return imageHandler
									.extractFilePathFromUrl(
										currentUser.profile_picture,
										'profiles'
									)
									.then((oldFilePath) => {
										if (oldFilePath) {
											return imageHandler
												.delete('profiles', oldFilePath)
												.then((deleted) => {
													if (!deleted) {
														console.warn(
															'Could not delete old profile picture'
														);
													}
													return deleted;
												});
										}
										return Promise.resolve(true);
									});
							}
							return Promise.resolve(true);
						})
						.then(() => {
							return imageHandler.uploadProfile(
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
				return auth.updateProfile(userId, newProfileData);
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
		return imageHandler
			.deleteAll(userId)
			.then((filesDeleted) => {
				if (!filesDeleted) {
					console.warn(
						'[useAuth] Some files could not be deleted, but continuing with account deletion'
					);
				}

				return auth.deleteUser(userId);
			})
			.then(() => {
				clearUserData();
				router.replace('/login');
				return true;
			})
			.catch((error: unknown) => {
				console.error('❌ Error deleting account:', error);
				throw error;
			});
	};

	const getUser = async () => {
		return auth
			.getCurrentUser()
			.then((user) => {
				return user;
			})
			.catch((error) => {
				setErrorMsg(`Error getting user profile: ${error}`);
				return null;
			});
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
		handleNextSignupPage,
		errorMsg,
	};
};
