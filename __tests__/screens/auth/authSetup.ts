import { router } from 'expo-router';

export const mockUseAuth = {
	login: jest.fn(),
	signUp: jest.fn(),
	errorMsg: '',
	clearError: jest.fn(),
	handleNextSignupPage: jest.fn(),
	updateUser: jest.fn(),
	resetPassword: jest.fn((newPassword, confirmNewPassword) => {
		return Promise.resolve(true);
	}),
	forgotPassword: jest.fn().mockResolvedValue(true),
};

export const mockAuthService = {
	handleLogin: jest.fn(),
	handleSignUp: jest.fn(),
	signUp: jest.fn(),
	login: jest.fn(),
};

export const mockUseSignUpProps = {
	signUpProps: {
		email: '',
		password: '',
		username: '',
		first_name: '',
		last_name: '',
		sneaker_size: 0,
		profile_picture: '',
		confirmPassword: '',
	},
	setSignUpProps: jest.fn(),
};

export const mockUser = {
	id: '1',
	username: 'testuser',
	first_name: 'John',
	last_name: 'Doe',
	sneaker_size: '10',
	email: 'test@example.com',
	profile_picture_url: '',
};

export const newMockUser = {
	...mockUser,
	username: 'remysnkr',
};

export const mockUseAsyncValidation = {
	checkUsernameExists: jest.fn(),
	checkEmailExists: jest.fn(),
	checkEmailExistsForReset: jest.fn().mockResolvedValue(null),
};

export const mockUseSizeConversion = {
	currentUnit: 'US',
	getSizeForCurrentUnit: jest.fn().mockReturnValue(10.5),
	formatSizeForDisplay: jest.fn().mockReturnValue('10.5'),
	generateBothSizes: jest.fn(),
	convertToCurrentUnit: jest.fn().mockReturnValue(10),
	getAvailableSizesForCurrentUnit: jest.fn(),
	isValidSizeInCurrentUnit: jest.fn(),
	formatCurrentUnitSize: jest.fn(),
	getOriginalUnit: jest.fn().mockReturnValue('US'),
	SneakerSizeConverter: {
		convertSize: jest.fn(),
		formatSize: jest.fn(),
		convertAndFormat: jest.fn(),
		getAvailableSizes: jest.fn(),
		isValidSize: jest.fn(),
		detectSizeUnit: jest.fn(),
		generateBothSizes: jest.fn(),
	},
};

jest.mock('@/hooks/useSizeConversion', () => ({
	useSizeConversion: () => mockUseSizeConversion,
}));

export const mockAuthInterface = {
	signIn: jest.fn().mockResolvedValue({
		id: 'test-user-id',
		email: 'test@example.com',
	}),
	signUp: jest.fn().mockResolvedValue({
		user: { id: 'test-user-id' },
		session: {},
	}),
	signOut: jest.fn().mockResolvedValue(true),
	getCurrentUser: jest.fn().mockResolvedValue(mockUser),
	updateProfile: jest.fn().mockResolvedValue(mockUser),
	deleteUser: jest.fn().mockResolvedValue(true),
	forgotPassword: jest.fn().mockResolvedValue(true),
	resetPassword: jest.fn().mockResolvedValue({ user: mockUser }),
	resetPasswordWithTokens: jest.fn().mockResolvedValue(true),
};

export const mockAuthProviderImpl = {
	signUp: jest.fn().mockResolvedValue({
		user: mockUser,
		session: { access_token: 'mock-token' },
	}),
	signIn: jest.fn().mockResolvedValue({
		user: mockUser,
		session: { access_token: 'mock-token' },
	}),
	signOut: jest.fn().mockResolvedValue(undefined),
	getCurrentUser: jest.fn().mockResolvedValue(mockUser),
	updateProfile: jest.fn().mockResolvedValue(mockUser),
	deleteUser: jest.fn().mockResolvedValue(true),
	forgotPassword: jest.fn().mockResolvedValue(undefined),
	resetPassword: jest.fn().mockResolvedValue({ user: mockUser }),
	resetPasswordWithTokens: jest.fn().mockResolvedValue(true),
	cleanupOrphanedSessions: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/interfaces/AuthInterface', () => ({
	AuthInterface: mockAuthInterface,
}));

jest.mock('@/domain/AuthProviderImpl', () => ({
	authProvider: mockAuthProviderImpl,
}));

export const resetMocks = () => {
	Object.values(mockAuthInterface).forEach((mock) => {
		if (jest.isMockFunction(mock)) {
			mock.mockClear();
		}
	});

	Object.values(mockAuthProviderImpl).forEach((mock) => {
		if (jest.isMockFunction(mock)) {
			mock.mockClear();
		}
	});
};
