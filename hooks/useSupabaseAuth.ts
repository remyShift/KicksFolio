import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { SupabaseAuthService } from '@/services/AuthService';
import type { User } from '@supabase/supabase-js';

export const useSupabaseAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [session, setSession] = useState<any>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signOut = async () => {
		await SupabaseAuthService.signOut();
	};

	return {
		user,
		session,
		loading,
		signOut,
		isAuthenticated: !!user,
	};
};
