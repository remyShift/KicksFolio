import AsyncStorage from '@react-native-async-storage/async-storage';

import { createClient } from '@supabase/supabase-js';

import {
	SUPABASE_CONFIG,
	validateSupabaseConfig,
} from '@/config/supabase/supabase.config';

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
