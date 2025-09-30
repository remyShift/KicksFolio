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
		let user;

		try {
			const {
				data: { user: authUser },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				// Handle session missing gracefully
				if (
					error.message?.includes('Auth session missing') ||
					error.name === 'AuthSessionMissingError'
				) {
					throw new Error('No user found');
				}
				throw error;
			}
			if (!authUser) throw new Error('No user found');

			user = authUser;
		} catch (error: any) {
			// Handle session missing gracefully
			if (
				error.message?.includes('Auth session missing') ||
				error.name === 'AuthSessionMissingError'
			) {
				throw new Error('No user found');
			}
			throw error;
		}

		// Check if this is an OAuth user with a linked account
		const isOAuthProvider =
			user.app_metadata?.provider &&
			['google', 'apple'].includes(user.app_metadata.provider);

		let actualUserId = user.id;

		if (isOAuthProvider) {
			try {
				const linkedUserId = await this.findUserByOAuthAccount(
					user.app_metadata.provider as 'google' | 'apple',
					user.id
				);
				if (linkedUserId) {
					actualUserId = linkedUserId;
				}
			} catch (linkError) {
				console.log(
					'ℹ️ No linked account found for OAuth user, using OAuth user ID'
				);
			}
		}

		const maxRetries = 3;
		const retryDelay = 500;
		let userData = null;
		let userError = null;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				const { data, error } = await supabase
					.from('users')
					.select('*')
					.eq('id', actualUserId)
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

		const [followersResult, followingResult, oauthAccountsResult] =
			await Promise.all([
				supabase
					.from('followers')
					.select('*', {
						count: 'exact',
						head: true,
					})
					.eq('following_id', actualUserId),
				supabase
					.from('followers')
					.select('*', {
						count: 'exact',
						head: true,
					})
					.eq('follower_id', actualUserId),
				supabase
					.from('oauth_accounts')
					.select('provider, provider_account_id')
					.eq('user_id', actualUserId)
					.eq('is_active', true),
			]);

		const followersCount = followersResult.error
			? 0
			: followersResult.count || 0;
		const followingCount = followingResult.error
			? 0
			: followingResult.count || 0;
		const linkedOAuthAccounts = oauthAccountsResult.error
			? []
			: oauthAccountsResult.data || [];

		return {
			...userData,
			followers_count: followersCount,
			following_count: followingCount,
			linked_oauth_accounts: linkedOAuthAccounts,
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

	async getAppleProviderAccountId(): Promise<string> {
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

			if (!credential.user) {
				throw new Error('No user ID received from Apple');
			}

			return credential.user;
		} catch (error: any) {
			if (error.code === 'ERR_REQUEST_CANCELED') {
				throw new Error('Authentication was canceled by user');
			}
			throw error;
		}
	}

	async getGoogleProviderAccountId(): Promise<string> {
		try {
			const { data: currentSessionData } =
				await supabase.auth.getSession();
			const savedSession = currentSessionData.session;

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
				throw new Error('Failed to get authentication tokens');
			}

			const { data, error } = await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken,
			});

			if (error || !data.user) {
				throw new Error('Failed to get user data');
			}

			let providerAccountId = data.user.id; // fallback
			if (data.user.identities && data.user.identities.length > 0) {
				const identity = data.user.identities.find(
					(id: any) => id.provider === 'google'
				);

				if (identity?.identity_data?.provider_id) {
					providerAccountId = identity.identity_data.provider_id;
				} else if (identity?.identity_data?.sub) {
					providerAccountId = identity.identity_data.sub;
				} else if (identity?.id) {
					providerAccountId = identity.id;
				}
			}

			if (savedSession) {
				await supabase.auth.setSession({
					access_token: savedSession.access_token,
					refresh_token: savedSession.refresh_token,
				});
			} else {
				await supabase.auth.signOut();
			}

			return providerAccountId;
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

	async getLinkedOAuthAccounts(userId: string) {
		const {
			data: { user: authUser },
		} = await supabase.auth.getUser();

		const { data, error } = await supabase
			.from('oauth_accounts')
			.select('*')
			.eq('user_id', userId)
			.eq('is_active', true);

		if (error) {
			console.error('❌ getLinkedOAuthAccounts: Query failed:', error);
			throw error;
		}

		return data || [];
	}

	async linkOAuthAccount(
		userId: string,
		provider: 'google' | 'apple',
		providerAccountId: string
	) {
		const {
			data: { user: authUser },
		} = await supabase.auth.getUser();

		const { data: existingAccount } = await supabase
			.from('oauth_accounts')
			.select('*')
			.eq('user_id', userId)
			.eq('provider', provider)
			.eq('provider_account_id', providerAccountId)
			.eq('is_active', false)
			.single();

		if (existingAccount) {
			const { data: reactivatedData, error } = await supabase
				.from('oauth_accounts')
				.update({ is_active: true })
				.eq('id', existingAccount.id)
				.select();

			if (error) {
				console.error('❌ OAuth reactivation failed:', error);
				throw error;
			}

			return true;
		}

		const { data: insertedData, error } = await supabase
			.from('oauth_accounts')
			.insert({
				user_id: userId,
				provider,
				provider_account_id: providerAccountId,
				is_active: true,
			})
			.select();

		if (error) {
			console.error('❌ OAuth linking failed:', error);
			throw error;
		}

		return true;
	}

	async unlinkOAuthAccount(userId: string, provider: 'google' | 'apple') {
		const {
			data: { user: authUser },
		} = await supabase.auth.getUser();

		const { data: existingRecords, error: selectError } = await supabase
			.from('oauth_accounts')
			.select('*')
			.eq('user_id', userId)
			.eq('provider', provider);

		if (selectError) {
			console.error('❌ Error fetching existing records:', selectError);
		}

		if (existingRecords && existingRecords.length > 0) {
			const { data: updatedData, error } = await supabase
				.from('oauth_accounts')
				.update({ is_active: false })
				.eq('id', existingRecords[0].id)
				.select();

			if (error) {
				console.error('❌ OAuth unlinking failed:', error);
				throw error;
			}

			if (!updatedData || updatedData.length === 0) {
				console.error(
					'❌ No records were updated - RLS policy blocking'
				);
				throw new Error(
					'OAuth account unlinking was blocked by security policy'
				);
			}

			return true;
		} else {
			return true;
		}
	}

	async findUserByOAuthAccount(
		provider: 'google' | 'apple',
		providerAccountId: string
	) {
		const { data, error } = await supabase
			.from('oauth_accounts')
			.select('user_id')
			.eq('provider', provider)
			.eq('provider_account_id', providerAccountId)
			.eq('is_active', true)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data?.user_id || null;
	}

	async hasPasswordAuth(userId?: string) {
		try {
			const {
				data: { user: authUser },
			} = await supabase.auth.getUser();

			if (!authUser) {
				return false;
			}

			let targetUserId = userId || authUser.id;

			if (
				!userId &&
				authUser.app_metadata?.provider &&
				['google', 'apple'].includes(authUser.app_metadata.provider)
			) {
				try {
					const linkedUserId = await this.findUserByOAuthAccount(
						authUser.app_metadata.provider as 'google' | 'apple',
						authUser.id
					);
					if (linkedUserId) {
						targetUserId = linkedUserId;
					}
				} catch (error) {
					console.log(
						'ℹ️ No linked account found, checking OAuth user password auth'
					);
				}
			}

			const { data, error } = await supabase.rpc(
				'get_user_has_password',
				{ user_id: targetUserId }
			);

			if (error) {
				console.error('Error checking password auth:', error);
				if (targetUserId === authUser.id) {
					return authUser.app_metadata?.provider === 'email';
				}
				return false;
			}

			return data === true;
		} catch (error) {
			console.error('Error checking password auth:', error);
			return false;
		}
	}

	async storePendingOAuthUser(
		authUserId: string,
		email: string,
		provider: 'google' | 'apple',
		providerAccountId: string,
		profilePicture?: string
	) {
		const { error } = await supabase.from('oauth_pending_users').insert({
			auth_user_id: authUserId,
			email,
			provider,
			provider_account_id: providerAccountId,
			profile_picture: profilePicture,
		});

		if (error) throw error;
		return true;
	}

	async getPendingOAuthUser(authUserId: string) {
		const { data, error } = await supabase
			.from('oauth_pending_users')
			.select('*')
			.eq('auth_user_id', authUserId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data;
	}

	async completePendingOAuthUser(
		authUserId: string,
		userData: {
			username: string;
			sneaker_size: number;
			profile_picture?: string;
		}
	) {
		const pendingUser = await this.getPendingOAuthUser(authUserId);

		if (!pendingUser) {
			throw new Error('No pending OAuth user found');
		}

		const { data: existingUser } = await supabase
			.from('users')
			.select('id')
			.eq('id', authUserId)
			.single();

		let createdUser;
		let userError;

		if (existingUser) {
			const { data, error } = await supabase
				.from('users')
				.update({
					username: userData.username,
					sneaker_size: userData.sneaker_size,
					profile_picture:
						userData.profile_picture || pendingUser.profile_picture,
				})
				.eq('id', authUserId)
				.select()
				.single();

			createdUser = data;
			userError = error;
		} else {
			const { data, error } = await supabase
				.from('users')
				.insert({
					id: authUserId,
					email: pendingUser.email,
					username: userData.username,
					sneaker_size: userData.sneaker_size,
					profile_picture:
						userData.profile_picture || pendingUser.profile_picture,
				})
				.select()
				.single();

			createdUser = data;
			userError = error;
		}

		if (userError) {
			console.error('❌ User creation failed:', userError);
			throw userError;
		}

		await this.linkOAuthAccount(
			createdUser.id,
			pendingUser.provider,
			authUserId
		);

		await supabase
			.from('oauth_pending_users')
			.delete()
			.eq('auth_user_id', authUserId);

		return createdUser;
	}
}

export const authProxy = new AuthProxy();
