import { Platform } from 'react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/config/supabase/supabase';
import { AuthProviderInterface, OAuthResult } from '@/domain/Auth';
import { UserInfo } from '@/types/user';

export class AuthProxy implements AuthProviderInterface {
	async signUp(email: string, password: string, userData: Partial<UserInfo>) {
		const result = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: undefined,
				data: {
					username: userData.username,
					sneaker_size: userData.sneaker_size,
					profile_picture: userData.profile_picture,
				},
			},
		});

		if (result.error) {
			throw result.error;
		}

		const maxRetries = 5;
		const retryDelay = 1000;
		let user = null;
		let userError = null;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				const { data: userData, error } = await supabase
					.from('users')
					.select('*')
					.eq('id', result.data.user?.id)
					.single();

				if (!error && userData) {
					user = userData;
					break;
				}

				if (attempt < maxRetries - 1) {
					await new Promise((resolve) =>
						setTimeout(resolve, retryDelay)
					);
				} else {
					userError = error;
				}
			} catch (error) {
				if (attempt < maxRetries - 1) {
					await new Promise((resolve) =>
						setTimeout(resolve, retryDelay)
					);
				} else {
					userError = error;
				}
			}
		}

		if (userError || !user) {
			await supabase.auth.signOut();
			throw userError || new Error('Failed to create user in database');
		}

		return { ...result.data, user };
	}

	async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;
		return data;
	}

	async deleteUser(userId: string) {
		const { error } = await supabase
			.from('users')
			.delete()
			.eq('id', userId);
		if (error) throw error;

		const { error: authError } = await supabase.rpc('delete_user_account', {
			user_id: userId,
		});
		if (authError) throw authError;

		await supabase.auth.signOut();

		return true;
	}

	async signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	}

	async getCurrentUser() {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) throw error;
		if (!user) throw new Error('No user found');

		const maxRetries = 3;
		const retryDelay = 500;
		let userData = null;
		let userError = null;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				const { data, error } = await supabase
					.from('users')
					.select('*')
					.eq('id', user.id)
					.single();

				if (!error && data) {
					userData = data;
					break;
				}

				if (attempt < maxRetries - 1) {
					await new Promise((resolve) =>
						setTimeout(resolve, retryDelay)
					);
				} else {
					userError = error;
				}
			} catch (error) {
				if (attempt < maxRetries - 1) {
					await new Promise((resolve) =>
						setTimeout(resolve, retryDelay)
					);
				} else {
					userError = error;
				}
			}
		}

		if (userError) throw userError;
		if (!userData) throw new Error('User data not found in database');

		const [followersResult, followingResult] = await Promise.all([
			supabase
				.from('followers')
				.select('*', {
					count: 'exact',
					head: true,
				})
				.eq('following_id', user.id),
			supabase
				.from('followers')
				.select('*', {
					count: 'exact',
					head: true,
				})
				.eq('follower_id', user.id),
		]);

		const followersCount = followersResult.error
			? 0
			: followersResult.count || 0;
		const followingCount = followingResult.error
			? 0
			: followingResult.count || 0;

		return {
			...userData,
			followers_count: followersCount,
			following_count: followingCount,
		};
	}

	async updateProfile(userId: string, userData: Partial<UserInfo>) {
		const { data, error } = await supabase
			.from('users')
			.update(userData)
			.eq('id', userId)
			.select()
			.single();

		if (error) {
			throw error;
		}

		return {
			...data,
			profile_picture_url: data.profile_picture,
		};
	}

	async forgotPassword(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: 'kicksfolio://reset-password',
		});
		if (error) throw error;
	}

	async resetPassword(newPassword: string) {
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			throw sessionError;
		}

		if (!session) {
			throw new Error(
				'No active session found. Please use the reset link from your email.'
			);
		}

		const { data, error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) {
			throw error;
		}

		return data;
	}

	async resetPasswordWithTokens(
		accessToken: string,
		refreshToken: string,
		newPassword: string
	) {
		return import('@supabase/supabase-js').then(
			async ({ createClient }) => {
				const tempSupabase = createClient(
					process.env.EXPO_PUBLIC_SUPABASE_URL!,
					process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
				);

				return tempSupabase.auth
					.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					})
					.then(() => {
						return tempSupabase.auth.updateUser({
							password: newPassword,
						});
					})
					.then((updateResult) => {
						if (updateResult.error) {
							throw updateResult.error;
						}

						return tempSupabase.auth.signOut();
					})
					.then((signOutResult) => {
						if (signOutResult.error) {
							throw signOutResult.error;
						}

						return true;
					});
			}
		);
	}

	async cleanupOrphanedSessions() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	}

	async signInWithApple(): Promise<OAuthResult> {
		if (Platform.OS !== 'ios') {
			throw new Error('Apple authentication is only available on iOS');
		}

		try {
			const isAvailable = await AppleAuthentication.isAvailableAsync();
			if (!isAvailable) {
				throw new Error(
					'Apple authentication is not available on this device'
				);
			}

			const credential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL,
				],
			});

			if (!credential.identityToken) {
				throw new Error('No identity token received from Apple');
			}

			const { data, error } = await supabase.auth.signInWithIdToken({
				provider: 'apple',
				token: credential.identityToken,
			});

			if (error) throw error;
			if (!data.user || !data.session) {
				throw new Error('Failed to authenticate with Apple');
			}

			return {
				user: data.user,
				session: data.session,
			};
		} catch (error: any) {
			if (error.code === 'ERR_REQUEST_CANCELED') {
				throw new Error('Authentication was canceled by user');
			}
			throw error;
		}
	}

	async signInWithGoogle(): Promise<OAuthResult> {
		try {
			WebBrowser.maybeCompleteAuthSession();

			const redirectUri = 'kicksfolio://auth';

			const authUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;

			const result = await WebBrowser.openAuthSessionAsync(
				authUrl,
				redirectUri
			);

			if (result.type !== 'success') {
				if (result.type === 'cancel') {
					throw new Error('Authentication was canceled by user');
				}
				throw new Error(
					`Authentication failed with type: ${result.type}`
				);
			}

			const url = result.url;

			let params: URLSearchParams;
			if (url.includes('#')) {
				const fragment = url.split('#')[1];
				params = new URLSearchParams(fragment);
			} else if (url.includes('?')) {
				const query = url.split('?')[1];
				params = new URLSearchParams(query);
			} else {
				throw new Error('No authentication data received');
			}

			const accessToken = params.get('access_token');
			const refreshToken = params.get('refresh_token');

			if (!accessToken || !refreshToken) {
				const error = params.get('error');
				const errorDescription = params.get('error_description');

				if (error) {
					throw new Error(
						`OAuth Error: ${error} - ${errorDescription || 'Unknown error'}`
					);
				}

				throw new Error('Failed to get authentication tokens');
			}

			const { data, error } = await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken,
			});

			if (error) throw error;
			if (!data.user || !data.session) {
				throw new Error('Failed to create session');
			}

			return {
				user: data.user,
				session: data.session,
			};
		} catch (error: any) {
			if (
				error.message?.includes('canceled') ||
				error.code === 'UserCancel'
			) {
				throw new Error('Authentication was canceled by user');
			}
			throw error;
		}
	}
}

export const authProxy = new AuthProxy();
