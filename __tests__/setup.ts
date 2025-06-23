import { act, cleanup, fireEvent } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import {
	mockAuthService,
	mockUseAuth,
	mockUseSignUpProps,
	mockUseCollections,
	mockUser,
	mockUseAsyncValidation,
} from './screens/auth/authSetup';
import { mockSneakers } from './screens/app/appSetup';

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
		FontAwesome6: Text,
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

jest.mock('../services/AuthService', () => ({
	AuthService: jest.fn().mockImplementation(() => mockAuthService),
}));

jest.mock('../hooks/useAuth', () => ({
	useAuth: jest.fn().mockReturnValue(mockUseAuth),
}));

jest.mock('../context/signUpPropsContext', () => ({
	useSignUpProps: () => mockUseSignUpProps,
}));

jest.mock('../hooks/useCollections', () => ({
	useCollections: () => mockUseCollections,
}));

jest.mock('../hooks/useAsyncValidation', () => ({
	useAsyncValidation: () => ({
		checkUsernameExists: jest.fn().mockResolvedValue(null),
		checkEmailExists: jest.fn().mockResolvedValue(null),
	}),
}));

jest.mock('../context/authContext', () => ({
	useSession: jest.fn().mockReturnValue({
		user: mockUser,
		isLoading: false,
		userCollection: null,
		setUserCollection: jest.fn(),
		userSneakers: [],
		setUserSneakers: jest.fn(),
		setUser: jest.fn(),
		refreshUserData: jest.fn(),
		refreshUserSneakers: jest.fn(),
	}),
}));

jest.mock('expo-font', () => ({
	loadAsync: jest.fn().mockResolvedValue(undefined),
	isLoaded: jest.fn().mockReturnValue(true),
	useFonts: () => [true, null],
	unloadAsync: jest.fn(),
	loadedNativeFonts: [],
}));

jest.mock('expo-router', () => ({
	Link: ({ children }: { children: React.ReactNode }) => children,
	useLocalSearchParams: jest.fn().mockReturnValue({ newUser: 'true' }),
	router: {
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	},
}));

jest.mock('../store/useModalStore', () => ({
	useModalStore: () => ({
		modalStep: 'index',
		isVisible: false,
		currentSneaker: null,
		setModalStep: jest.fn(),
		setIsVisible: jest.fn(),
		setCurrentSneaker: jest.fn(),
		resetModal: jest.fn(),
	}),
}));

jest.mock('../config/supabase/supabase', () => ({
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

jest.mock('../hooks/useAsyncValidation', () => ({
	useAsyncValidation: () => mockUseAsyncValidation,
}));

const originalConsoleError = console.error;

beforeEach(() => {
	console.error = jest.fn();
});

afterEach(() => {
	cleanup();
	jest.clearAllMocks();
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
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 100));
	});
};
