import { cleanup } from '@testing-library/react-native';
import '@testing-library/react-native/extend-expect';

import i18n from '@/locales/i18n';

import './auth';
import './stores';
import './supabase';
import './ui';

jest.mock('expo-localization', () => ({
	getLocales: () => [
		{
			languageCode: 'en',
			languageTag: 'en-US',
			regionCode: 'US',
			currencyCode: 'USD',
			currencySymbol: '$',
			decimalSeparator: '.',
			digitGroupingSeparator: ',',
			textDirection: 'ltr',
			measurementSystem: 'imperial',
			temperatureUnit: 'fahrenheit',
		},
	],
	getCalendars: () => [
		{
			calendar: 'gregorian',
			timeZone: 'America/New_York',
			uses24hourClock: false,
			firstWeekday: 1,
		},
	],
}));

jest.mock('expo-image', () => ({
	Image: 'Image',
}));

jest.mock('expo-camera', () => ({
	Camera: 'Camera',
	CameraView: 'CameraView',
	useCameraPermissions: () => [null, jest.fn()],
	requestCameraPermissionsAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
	launchImageLibraryAsync: jest.fn(),
	launchCameraAsync: jest.fn(),
	requestMediaLibraryPermissionsAsync: jest.fn(),
	requestCameraPermissionsAsync: jest.fn(),
	MediaTypeOptions: {
		Images: 'Images',
		Videos: 'Videos',
		All: 'All',
	},
	ImagePickerResult: {},
}));

afterEach(() => {
	cleanup();
	jest.clearAllTimers();
});

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
