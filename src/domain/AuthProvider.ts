import { supabase } from '@/config/supabase/supabase';
import { AuthProviderInterface } from '@/interfaces/AuthInterface';

export interface SupabaseUser {
	id: string;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	sneaker_size: number;
	profile_picture?: string;
	created_at: string;
	updated_at: string;
	instagram_username?: string;
	social_media_visibility?: boolean;
}

export class AuthProvider implements AuthProviderInterface {
	async signUp(
		email: string,
		password: string,
		userData: Partial<SupabaseUser>
	) {
		const result = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: undefined,
				data: {
					username: userData.username,
					first_name: userData.first_name,
					last_name: userData.last_name,
					sneaker_size: userData.sneaker_size,
					profile_picture: userData.profile_picture,
				},
			},
		});

		if (result.error) {
			throw result.error;
		}

		const { data: user, error: userError } = await supabase
			.from('users')
			.insert([
				{
					id: result.data.user?.id,
					email: email,
					username: userData.username,
					first_name: userData.first_name,
					last_name: userData.last_name,
					sneaker_size: userData.sneaker_size,
					profile_picture: userData.profile_picture,
				},
			])
			.select()
			.single();

		if (userError) {
			await supabase.auth.signOut();
			throw userError;
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

		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('*')
			.eq('id', user.id)
			.single();

		if (userError) throw userError;

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

	async updateProfile(userId: string, userData: Partial<SupabaseUser>) {
		const { data, error } = await supabase
			.from('users')
			.update(userData)
			.eq('id', userId)
			.select()
			.single();

		if (error) throw error;
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
}

export const authProvider = new AuthProvider();
