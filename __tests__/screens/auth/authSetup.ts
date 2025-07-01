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
	forgotPassword: jest.fn(),
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
};

export const mockUseSizeConversion = {
	currentUnit: 'US',
	getSizeForCurrentUnit: jest.fn(),
	formatSizeForDisplay: jest.fn(),
	generateBothSizes: jest.fn(),
	convertToCurrentUnit: jest.fn().mockReturnValue(10),
	getAvailableSizesForCurrentUnit: jest.fn(),
	isValidSizeInCurrentUnit: jest.fn(),
	formatCurrentUnitSize: jest.fn(),
	getOriginalUnit: jest.fn().mockReturnValue('US'),
	SizeConversionService: {
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
