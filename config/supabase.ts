export const SUPABASE_CONFIG = {
	url: 'https://plcrcefkuefozxjtnmls.supabase.co',
	anonKey:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsY3JjZWZrdWVmb3p4anRubWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODQ0MTMsImV4cCI6MjA2NTY2MDQxM30.vrZFPV1ACf-rT2rlY54peWVCwk2JF_KsfcxkrbKiPjo',

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
