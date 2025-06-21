import { supabase } from '@/services/supabase';

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
}

export class SupabaseAuthService {
	static async signUp(
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

	static async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;
		return data;
	}

	static async deleteUser(userId: string) {
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

	static async signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	}

	static async getCurrentUser() {
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
		return userData;
	}

	static async updateProfile(
		userId: string,
		userData: Partial<SupabaseUser>
	) {
		const { data, error } = await supabase
			.from('users')
			.update(userData)
			.eq('id', userId)
			.select()
			.single();

		if (error) throw error;
		return { ...data, profile_picture_url: data.profile_picture };
	}

	static async resetPassword(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email);
		if (error) throw error;
	}

	static async cleanupOrphanedSessions() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	}
}
