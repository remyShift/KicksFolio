export const mockUseAuth = {
	login: jest.fn(),
	signUp: jest.fn(),
	errorMsg: '',
	clearError: jest.fn(),
	handleNextSignupPage: jest.fn(),
	forgotPassword: jest.fn(),
	updateUser: jest.fn(),
	resetPassword: jest.fn((token, newPassword, confirmNewPassword) => {
		return Promise.resolve(true);
	}),
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

export const mockUseCreateCollection = {
	createCollection: jest.fn(),
	error: '',
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
