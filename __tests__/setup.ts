import { act, cleanup, fireEvent } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import {
	mockAuthService,
	mockUseAuth,
	mockUseSignUpProps,
	mockUseCreateCollection,
} from './pages/auth/authSetup';

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

jest.mock('@/services/AuthService', () => ({
	AuthService: jest.fn().mockImplementation(() => mockAuthService),
}));

jest.mock('@/hooks/useAuth', () => ({
	useAuth: () => mockUseAuth,
}));

jest.mock('@/context/signUpPropsContext', () => ({
	useSignUpProps: () => mockUseSignUpProps,
}));

jest.mock('@/hooks/useCreateCollection', () => ({
	useCreateCollection: () => mockUseCreateCollection,
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
