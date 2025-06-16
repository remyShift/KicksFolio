import { BaseApiService } from '@/services/BaseApiService';
import { supabase } from './supabase';

export interface SupabaseCollection {
	id: string;
	name: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}

export class SupabaseCollectionService extends BaseApiService {
	static async getUserCollections(userId: string) {
		const { data, error } = await supabase
			.from('collections')
			.select('*')
			.eq('user_id', userId);

		if (error) throw error;
		return data;
	}

	static async createCollection(name: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('collections')
			.insert([
				{
					name,
					user_id: user.id,
				},
			])
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async updateCollection(
		id: string,
		updates: Partial<SupabaseCollection>
	) {
		const { data, error } = await supabase
			.from('collections')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async deleteCollection(id: string) {
		const { error } = await supabase
			.from('collections')
			.delete()
			.eq('id', id);

		if (error) throw error;
	}
}
