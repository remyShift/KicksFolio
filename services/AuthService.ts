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
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: userData,
			},
		});

		if (error) throw error;

		if (data.user) {
			const { error: userError } = await supabase.from('users').insert([
				{
					id: data.user.id,
					email: userData.email,
					username: userData.username,
					first_name: userData.first_name,
					last_name: userData.last_name,
					sneaker_size: userData.sneaker_size,
				},
			]);

			if (userError) throw userError;

			const { error: colError } = await supabase
				.from('collections')
				.insert([
					{
						name: 'Ma Collection',
						user_id: data.user.id,
					},
				]);

			if (colError) throw colError;
		}

		return data;
	}

	static async signIn(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;
		return data;
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

		if (user) {
			const { data: userData, error: userError } = await supabase
				.from('users')
				.select('*')
				.eq('id', user.id)
				.single();

			if (userError) throw userError;
			return userData;
		}

		return null;
	}

	static async updateProfile(userData: Partial<SupabaseUser>) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('users')
			.update(userData)
			.eq('id', user.id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async resetPassword(email: string) {
		const { error } = await supabase.auth.resetPasswordForEmail(email);
		if (error) throw error;
	}
}
