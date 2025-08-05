jest.mock('@/config/supabase/supabase.config', () => ({
	SUPABASE_CONFIG: {
		url: 'http://toto.com',
		anonKey: 'test',
		options: {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: false,
			},
		},
	},
	validateSupabaseConfig: jest.fn().mockReturnValue(true),
}));

const createSupabaseMock = () => ({
	auth: {
		signUp: jest.fn().mockResolvedValue({
			data: null,
			error: null,
		}),
		signInWithPassword: jest.fn().mockResolvedValue({
			data: null,
			error: null,
		}),
		signOut: jest.fn().mockResolvedValue({ error: null }),
		resetPasswordForEmail: jest.fn().mockResolvedValue({
			data: null,
			error: null,
		}),
		updateUser: jest.fn().mockResolvedValue({
			data: null,
			error: null,
		}),
		getSession: jest.fn().mockResolvedValue({
			data: { session: null },
			error: null,
		}),
		onAuthStateChange: jest.fn().mockReturnValue({
			data: {
				subscription: {
					unsubscribe: jest.fn(),
				},
			},
		}),
	},
	from: jest.fn().mockReturnValue({
		select: jest.fn().mockReturnThis(),
		insert: jest.fn().mockReturnThis(),
		update: jest.fn().mockReturnThis(),
		delete: jest.fn().mockReturnThis(),
		eq: jest.fn().mockReturnThis(),
		order: jest.fn().mockReturnThis(),
		limit: jest.fn().mockReturnThis(),
		single: jest.fn().mockResolvedValue({
			data: null,
			error: null,
		}),
	}),
	storage: {
		from: jest.fn().mockReturnValue({
			upload: jest.fn(),
			download: jest.fn(),
			remove: jest.fn(),
			getPublicUrl: jest.fn().mockReturnValue({
				data: {
					publicUrl: 'mocked-url',
				},
			}),
		}),
	},
});

jest.mock('@supabase/supabase-js', () => ({
	createClient: jest.fn().mockReturnValue(createSupabaseMock()),
}));

jest.mock('@/config/supabase/supabase', () => ({
	supabase: createSupabaseMock(),
}));
