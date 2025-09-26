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
					console.log(
						'🔍 OAuth user has linked account, using linked user ID:',
						linkedUserId
					);
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

		const [followersResult, followingResult] = await Promise.all([
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

	async getLinkedOAuthAccounts(userId: string) {
		console.log('🔍 getLinkedOAuthAccounts: Checking for user:', userId);

		const {
			data: { user: authUser },
		} = await supabase.auth.getUser();
		console.log('🔍 getLinkedOAuthAccounts: Current auth user:', {
			authUserId: authUser?.id,
			provider: authUser?.app_metadata?.provider,
		});

		const { data, error } = await supabase
			.from('oauth_accounts')
			.select('*')
			.eq('user_id', userId);

		console.log('📋 getLinkedOAuthAccounts: Query result:', {
			data,
			error,
		});

		if (error) {
			console.error('❌ getLinkedOAuthAccounts: Query failed:', error);
			throw error;
		}

		console.log(
			'✅ getLinkedOAuthAccounts: Returning',
			data?.length || 0,
			'linked accounts'
		);
		return data || [];
	}

	async linkOAuthAccount(
		userId: string,
		provider: 'google' | 'apple',
		providerAccountId: string
	) {
		const { error } = await supabase.from('oauth_accounts').insert({
			user_id: userId,
			provider,
			provider_account_id: providerAccountId,
		});

		if (error) throw error;
		return true;
	}

	async unlinkOAuthAccount(userId: string, provider: 'google' | 'apple') {
		console.log('🔓 AuthProxy.unlinkOAuthAccount called with:', {
			userId,
			provider,
		});

		const {
			data: { user: authUser },
		} = await supabase.auth.getUser();
		console.log('🔍 Current auth user:', {
			authUserId: authUser?.id,
			authUserIdType: typeof authUser?.id,
			provider: authUser?.app_metadata?.provider,
		});

		const { data: existingRecords, error: selectError } = await supabase
			.from('oauth_accounts')
			.select('*')
			.eq('user_id', userId)
			.eq('provider', provider);

		console.log('📋 Existing OAuth records to delete:', existingRecords);
		console.log(
			'🔍 Record details:',
			existingRecords?.[0]
				? {
						provider_account_id:
							existingRecords[0].provider_account_id,
						provider_account_id_type:
							typeof existingRecords[0].provider_account_id,
						auth_uid_matches:
							authUser?.id ===
							existingRecords[0].provider_account_id,
						auth_uid_matches_string:
							authUser?.id ===
							existingRecords[0].provider_account_id.toString(),
						string_auth_uid_matches:
							authUser?.id?.toString() ===
							existingRecords[0].provider_account_id,
					}
				: 'No records'
		);

		if (selectError) {
			console.error('❌ Error fetching existing records:', selectError);
		}

		if (existingRecords && existingRecords.length > 0) {
			console.log(
				'🎯 Attempting deletion by record ID:',
				existingRecords[0].id
			);
			const { data: deletedData, error } = await supabase
				.from('oauth_accounts')
				.delete()
				.eq('id', existingRecords[0].id)
				.select();

			console.log('🗑️ Deletion by ID result:', { deletedData, error });

			if (error) {
				console.error('❌ OAuth unlinking by ID failed:', error);
				throw error;
			}

			if (!deletedData || deletedData.length === 0) {
				console.error(
					'❌ No records were deleted - RLS policy blocking'
				);
				throw new Error(
					'OAuth account unlinking was blocked by security policy'
				);
			}

			console.log('✅ OAuth unlinking completed successfully');
			return true;
		} else {
			console.log('ℹ️ No OAuth account found to unlink');
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
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null;
			}
			throw error;
		}

		return data?.user_id || null;
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

		const { data: createdUser, error: userError } = await supabase
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

		if (userError) throw userError;

		await this.linkOAuthAccount(
			authUserId,
			pendingUser.provider,
			pendingUser.provider_account_id
		);

		await supabase
			.from('oauth_pending_users')
			.delete()
			.eq('auth_user_id', authUserId);

		return createdUser;
	}
}

export const authProxy = new AuthProxy();
