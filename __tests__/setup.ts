import { act, cleanup, fireEvent } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
	__esModule: true,
	default: {
		getItem: jest.fn(),
		setItem: jest.fn(),
		removeItem: jest.fn(),
		clear: jest.fn(),
	},
}));

jest.mock('expo-secure-store', () => ({
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
	deleteItemAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
	const { Text } = require('react-native');
	return {
		Ionicons: Text,
		FontAwesome: Text,
		MaterialIcons: Text,
		AntDesign: Text,
		Entypo: Text,
		EvilIcons: Text,
		Feather: Text,
		FontAwesome5: Text,
		Foundation: Text,
		MaterialCommunityIcons: Text,
		Octicons: Text,
		SimpleLineIcons: Text,
		Zocial: Text,
	};
});

export const mockUseAuth = {
	login: jest.fn(),
	signUp: jest.fn(),
	errorMsg: '',
	clearError: jest.fn(),
	handleNextSignupPage: jest.fn(),
};

export const mockAuthService = {
	handleLogin: jest.fn(),
	handleSignUp: jest.fn(),
	signUp: jest.fn(),
	login: jest.fn(),
};

jest.mock('@/services/AuthService', () => ({
	AuthService: jest.fn().mockImplementation(() => mockAuthService),
}));

jest.mock('@/hooks/useAuth', () => ({
	useAuth: () => mockUseAuth,
}));

const originalConsoleError = console.error;

beforeEach(() => {
	console.error = jest.fn();
});

afterEach(() => {
	cleanup();
	console.error = originalConsoleError;
});

export const fillAndBlurInput = async (
	input: ReactTestInstance,
	value: string
) => {
	await act(async () => {
		fireEvent.changeText(input, value);
	});
	await act(async () => {
		fireEvent(input, 'blur');
	});
};
