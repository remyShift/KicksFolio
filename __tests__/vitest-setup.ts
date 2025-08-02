import { vi, beforeAll, afterAll, afterEach } from 'vitest';

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
	supabase: {
		auth: {
			signUp: vi.fn(),
			signInWithPassword: vi.fn(),
			signOut: vi.fn(),
			getUser: vi.fn(),
			updateUser: vi.fn(),
			resetPasswordForEmail: vi.fn(),
			updatePassword: vi.fn(),
			setSession: vi.fn(),
			getSession: vi.fn(),
		},
		from: vi.fn(() => ({
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			single: vi.fn(),
			update: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
		})),
	},
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

vi.mock('@/domain/AuthProviderImpl', () => ({
	authProvider: {
		signIn: vi.fn(),
		signUp: vi.fn(),
		signOut: vi.fn(),
		getCurrentUser: vi.fn(),
		updateProfile: vi.fn(),
		deleteUser: vi.fn(),
		forgotPassword: vi.fn(),
		resetPassword: vi.fn(),
		resetPasswordWithTokens: vi.fn(),
		cleanupOrphanedSessions: vi.fn(),
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
