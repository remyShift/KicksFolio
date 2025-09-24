import { useCallback } from 'react';

import { supabase } from '@/config/supabase/supabase';

export const useAnonymousAuth = () => {
	const ensureAnonymousAuth = useCallback(async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session?.user) {
				return session.user;
			}

			const { data, error } = await supabase.auth.signInAnonymously();

			if (error) {
				throw error;
			}

			return data.user;
		} catch (error) {
			console.error('Failed to ensure anonymous auth:', error);
			throw error;
		}
	}, []);

	return { ensureAnonymousAuth };
};
