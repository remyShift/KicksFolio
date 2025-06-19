const supabaseUrl = process.env.EXPO_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_SUPABASE_ANON_KEY;

console.log('supabaseUrl', supabaseUrl);
console.log('supabaseAnonKey', supabaseAnonKey);

export const SUPABASE_CONFIG = {
	url: supabaseUrl,
	anonKey: supabaseAnonKey,

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
