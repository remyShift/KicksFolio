import { vi, beforeAll, afterEach } from 'vitest';

vi.mock('react-native', () => ({
	Platform: {
		OS: 'ios',
		select: vi.fn(),
	},
	Dimensions: {
		get: vi.fn(() => ({ width: 375, height: 812 })),
	},
}));

vi.mock('expo-constants', () => ({
	default: {
		statusBarHeight: 44,
		deviceName: 'iPhone',
	},
}));

vi.mock('expo-font', () => ({
	loadAsync: vi.fn(),
	isLoaded: vi.fn(() => true),
}));

vi.mock('expo-asset', () => ({
	Asset: {
		loadAsync: vi.fn(),
	},
}));

vi.mock('@/config/supabase/supabase.config', () => ({
	SUPABASE_CONFIG: {
		url: 'http://test.supabase.co',
		anonKey: 'test-anon-key',
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
	},
	validateSupabaseConfig: vi.fn().mockReturnValue(true),
}));

const createSupabaseMock = () => ({
	auth: {
		signUp: vi.fn().mockResolvedValue({
			data: { user: { id: 'test-user-id' }, session: null },
			error: null,
		}),
		signInWithPassword: vi.fn().mockResolvedValue({
			data: { user: { id: 'test-user-id' }, session: null },
			error: null,
		}),
		signOut: vi.fn().mockResolvedValue({ error: null }),
		getUser: vi.fn().mockResolvedValue({
			data: { user: { id: 'test-user-id' } },
			error: null,
		}),
		updateUser: vi.fn().mockResolvedValue({
			data: { user: { id: 'test-user-id' } },
			error: null,
		}),
		resetPasswordForEmail: vi.fn().mockResolvedValue({
			data: {},
			error: null,
		}),
		getSession: vi.fn().mockResolvedValue({
			data: { session: null },
			error: null,
		}),
		setSession: vi.fn().mockResolvedValue({
			data: { session: null },
			error: null,
		}),
	},
	from: vi.fn(() => ({
		select: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data: null, error: null }),
	})),
	rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
});

vi.mock('@/config/supabase/supabase', () => ({
	supabase: createSupabaseMock(),
}));

vi.mock('@supabase/supabase-js', () => ({
	createClient: vi.fn(() => createSupabaseMock()),
}));

vi.mock('expo-router', () => ({
	router: {
		push: vi.fn(),
		replace: vi.fn(),
		back: vi.fn(),
	},
}));

vi.mock('@/context/authContext', () => ({
	useSession: vi.fn(() => ({
		user: null,
		setUser: vi.fn(),
		refreshUserData: vi.fn(),
		clearUserData: vi.fn(),
	})),
}));

vi.mock('@/store/useModalStore', () => ({
	useModalStore: vi.fn(),
}));

vi.mock('@/domain/AuthProvider', () => ({
	authProvider: {
		signIn: vi
			.fn()
			.mockResolvedValue({ user: { id: 'test-user-id' }, session: null }),
		signUp: vi.fn().mockResolvedValue({
			data: { user: { id: 'test-user-id' }, session: null },
		}),
		signOut: vi.fn().mockResolvedValue(undefined),
		getCurrentUser: vi.fn().mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
			followers_count: 0,
			following_count: 0,
		}),
		updateProfile: vi.fn().mockResolvedValue({
			id: 'test-user-id',
			email: 'test@example.com',
		}),
		deleteUser: vi.fn().mockResolvedValue(true),
		forgotPassword: vi.fn().mockResolvedValue(undefined),
		resetPassword: vi
			.fn()
			.mockResolvedValue({ user: { id: 'test-user-id' } }),
		resetPasswordWithTokens: vi.fn().mockResolvedValue(true),
		cleanupOrphanedSessions: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock('@/domain/ImageProvider', () => ({
	ImageProvider: {
		uploadProfileImage: vi.fn().mockResolvedValue({
			success: true,
			url: 'https://example.com/uploaded-image.jpg',
		}),
		extractFilePathFromUrl: vi.fn().mockReturnValue('old-file-path'),
		deleteImage: vi.fn().mockResolvedValue(true),
		deleteAllUserFiles: vi.fn().mockResolvedValue(true),
	},
}));

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, params?: any) => {
			const translations: { [key: string]: string } = {
				'auth.error.login': 'An error occurred during login.',
				'auth.error.signUp': 'An error occurred during sign up.',
				'auth.error.samePasswordAsOld':
					'The new password must be different from the old one.',
				'auth.form.password.error.size':
					'Password must be at least 8 characters long.',
				'ui.errors.global': 'Please correct the errors in the form.',
			};
			return translations[key] || key;
		},
		i18n: {
			changeLanguage: vi.fn(),
		},
	}),
}));

beforeAll(() => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.clearAllMocks();
});
