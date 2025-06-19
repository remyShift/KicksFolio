import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_CONFIG, validateSupabaseConfig } from '../config/supabase';

validateSupabaseConfig();

export const supabase = createClient(
	SUPABASE_CONFIG.url || '',
	SUPABASE_CONFIG.anonKey || '',
	{
		auth: {
			storage: AsyncStorage,
			...SUPABASE_CONFIG.options.auth,
		},
	}
);

export interface Friendship {
	id: string;
	user_id: string;
	friend_id: string;
	status: 'pending' | 'accepted' | 'blocked';
	created_at: string;
	updated_at: string;
}

export class SupabaseFriendshipService {
	static async sendFriendRequest(friendId: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('friendships')
			.insert([
				{
					user_id: user.id,
					friend_id: friendId,
					status: 'pending',
				},
			])
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async acceptFriendRequest(friendshipId: string) {
		const { data, error } = await supabase
			.from('friendships')
			.update({ status: 'accepted' })
			.eq('id', friendshipId)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	static async getFriends() {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('friendships')
			.select(
				`
        *,
        friend:users!friendships_friend_id_fkey(id, username, first_name, last_name, profile_picture)
      `
			)
			.eq('user_id', user.id)
			.eq('status', 'accepted');

		if (error) throw error;
		return data;
	}

	static async getPendingRequests() {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('friendships')
			.select(
				`
        *,
        requester:users!friendships_user_id_fkey(id, username, first_name, last_name, profile_picture)
      `
			)
			.eq('friend_id', user.id)
			.eq('status', 'pending');

		if (error) throw error;
		return data;
	}

	static async searchUsers(query: string) {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError) throw authError;
		if (!user) throw new Error('No user found');

		const { data, error } = await supabase
			.from('users')
			.select('id, username, first_name, last_name, profile_picture')
			.or(
				`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`
			)
			.neq('id', user.id)
			.limit(10);

		if (error) throw error;
		return data;
	}
}
