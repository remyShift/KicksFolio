import { cleanup } from '@testing-library/react-native';
import '@testing-library/react-native/extend-expect';

afterEach(() => {
	cleanup();
	jest.clearAllTimers();
});

import './supabase';
import './ui';
import './auth';
import './stores';

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

import i18n from '@/locales/i18n';

const originalConsole = {
	log: console.log,
	warn: console.warn,
	error: console.error,
	info: console.info,
	debug: console.debug,
};

beforeAll(async () => {
	if (!i18n.isInitialized) {
		await i18n.init();
	}
	await i18n.changeLanguage('en');

	console.error = jest.fn();
	console.log = jest.fn();
	console.warn = jest.fn();
	console.info = jest.fn();
	console.debug = jest.fn();
});

afterEach(() => {
	cleanup();
	jest.clearAllMocks();
});
