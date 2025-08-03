export const mockUser = {
	id: '1',
	username: 'testuser',
	first_name: 'John',
	last_name: 'Doe',
	sneaker_size: '10',
	email: 'test@example.com',
	profile_picture_url: '',
};

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
	logout: jest.fn().mockResolvedValue(true),
	deleteAccount: jest.fn().mockResolvedValue(true),
	getUser: jest.fn().mockResolvedValue(mockUser),
	getUserSneakers: jest.fn().mockResolvedValue(undefined),
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

export const newMockUser = {
	...mockUser,
	username: 'remysnkr',
};

export const mockUseValidation = {
	checkUsernameExists: jest.fn(),
	checkEmailExists: jest.fn(),
	checkEmailExistsForReset: jest.fn().mockResolvedValue(null),
	validateSignUpStep1Async: jest.fn().mockResolvedValue({
		isValid: true,
		errorMsg: '',
	}),
	errorMsg: '',
	setErrorMsg: jest.fn(),
};

export const mockUseSizeConversion = {
	currentUnit: 'US',
	getSizeForCurrentUnit: jest.fn().mockReturnValue(10.5),
	formatSizeForDisplay: jest.fn().mockReturnValue('10.5 US'),
	generateBothSizes: jest
		.fn()
		.mockReturnValue({ size_eu: 44, size_us: 10.5 }),
	convertToCurrentUnit: jest.fn().mockReturnValue(10),
	getAvailableSizesForCurrentUnit: jest
		.fn()
		.mockReturnValue([7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11]),
	isValidSizeInCurrentUnit: jest.fn().mockReturnValue(true),
	formatCurrentUnitSize: jest.fn().mockReturnValue('10.5 US'),
	getOriginalUnit: jest.fn().mockReturnValue('US'),
	convertAndFormat: jest.fn().mockReturnValue('44 EU'),
};

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

jest.mock('@/context/signUpPropsContext', () => ({
	useSignUpProps: () => mockUseSignUpProps,
}));

jest.mock('@/hooks/useAuthValidation', () => ({
	useAuthValidation: () => mockUseValidation,
}));

jest.mock('@/hooks/ui/useToast', () => ({
	__esModule: true,
	default: jest.fn(() => ({
		showSuccessToast: jest.fn(),
		showErrorToast: jest.fn(),
		showInfoToast: jest.fn(),
	})),
	useToast: () => ({
		showSuccessToast: jest.fn(),
		showErrorToast: jest.fn(),
		showInfoToast: jest.fn(),
	}),
}));

jest.mock('@/context/authContext', () => ({
	useSession: jest.fn().mockReturnValue({
		user: mockUser,
		isLoading: false,
		userSneakers: [],
		setUserSneakers: jest.fn(),
		setUser: jest.fn(),
		refreshUserData: jest.fn(),
		refreshUserSneakers: jest.fn(),
	}),
}));

jest.mock('@/hooks/useSizeConversion', () => ({
	useSizeConversion: () => mockUseSizeConversion,
}));

jest.mock('@/services/TODO/FormValidationService', () => ({
	FormValidationService: {
		validateUsername: jest.fn(),
		validateFirstName: jest.fn(),
		validateLastName: jest.fn(),
		validateSneakerSize: jest.fn(),
		validateModel: jest.fn(),
		validateSize: jest.fn(),
		validateCondition: jest.fn(),
		validatePrice: jest.fn(),
	},
}));
