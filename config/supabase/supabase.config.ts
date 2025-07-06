const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

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
		console.error(
			'❌ SUPABASE_URL is not set. Please add EXPO_PUBLIC_SUPABASE_URL to your environment variables.'
		);
		throw new Error('SUPABASE_URL is required');
	}

	if (!SUPABASE_CONFIG.anonKey) {
		console.error(
			'❌ SUPABASE_ANON_KEY is not set. Please add EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment variables.'
		);
		throw new Error('SUPABASE_ANON_KEY is required');
	}

	console.log('✅ Supabase configuration validated successfully');
	return true;
};
