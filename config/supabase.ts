export const SUPABASE_CONFIG = {
	url: process.env.EXPO_PUBLIC_SUPABASE_URL,
	anonKey: process.env.EXPO_SUPABASE_ANON_KEY,

	options: {
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
		realtime: {
			enabled: true,
		},
	},
};

export const validateSupabaseConfig = () => {
	if (!SUPABASE_CONFIG.url) {
		console.warn(
			'⚠️ SUPABASE_URL is not set. Please update your configuration.'
		);
		return false;
	}

	if (!SUPABASE_CONFIG.anonKey) {
		console.warn(
			'⚠️ SUPABASE_ANON_KEY is not set. Please update your configuration.'
		);
		return false;
	}

	return true;
};
