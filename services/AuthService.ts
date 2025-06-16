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
			},
		});

		if (result.error) {
			console.log('Error details:', {
				message: result.error.message,
				status: result.error.status,
				code: result.error.name,
			});
		}

		if (result.error) throw result.error;

		return result.data;
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

	static async createUserProfile(userData: Partial<SupabaseUser>) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No authenticated user found');

		const { error: updateError } = await supabase.auth.updateUser({
			data: {
				username: userData.username,
				first_name: userData.first_name,
				last_name: userData.last_name,
				sneaker_size: userData.sneaker_size,
				profile_picture: userData.profile_picture || null,
			},
		});

		if (updateError) {
			console.error('Error updating user metadata:', updateError);
		} else {
			console.log('User metadata updated successfully');
		}

		const { data: existingUser } = await supabase
			.from('users')
			.select('id')
			.eq('id', user.id)
			.single();

		if (existingUser) {
			console.log('User profile already exists');
			return existingUser;
		}

		const userToInsert = {
			id: user.id,
			email: userData.email || user.email,
			username: userData.username,
			first_name: userData.first_name,
			last_name: userData.last_name,
			sneaker_size: userData.sneaker_size,
			profile_picture: userData.profile_picture || null,
		};

		console.log('Creating user profile manually:', userToInsert);

		const { data, error } = await supabase
			.from('users')
			.insert([userToInsert])
			.select()
			.single();

		if (error) {
			console.error('Error creating user profile:', error);
			throw error;
		}

		console.log('User profile created successfully:', data);
		return data;
	}

	static async cleanupOrphanedSessions() {
		console.log('Nettoyage des sessions orphelines...');
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Erreur lors du nettoyage des sessions:', error);
		} else {
			console.log('Sessions nettoyées avec succès');
		}
	}
}
