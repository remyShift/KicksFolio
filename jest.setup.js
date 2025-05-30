import 'react-native-gesture-handler/jestSetup';
import { mockAuth } from './__mocks__/api/auth';
import { mockSecureStore } from './__mocks__/storage/secureStore';

jest.mock('@react-native-async-storage/async-storage', () => {
	const mockAsyncStorage = {
		setItem: jest.fn(() => Promise.resolve()),
		getItem: jest.fn(() => Promise.resolve(null)),
		removeItem: jest.fn(() => Promise.resolve()),
		clear: jest.fn(() => Promise.resolve()),
		getAllKeys: jest.fn(() => Promise.resolve([])),
	};
	return mockAsyncStorage;
});

jest.mock('expo-router', () => ({
	router: {
		replace: jest.fn(),
		push: jest.fn(),
	},
	useRouter: () => ({
		replace: jest.fn(),
		push: jest.fn(),
	}),
}));

jest.mock('expo-secure-store', () => mockSecureStore);

jest.mock('./context/authContext');

global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		status: 200,
		text: () => Promise.resolve(''),
		json: () => Promise.resolve({}),
	})
);

global.FormData = jest.fn(() => ({
	append: jest.fn(),
	delete: jest.fn(),
	get: jest.fn(),
	getAll: jest.fn(),
	has: jest.fn(),
	set: jest.fn(),
	entries: jest.fn(),
	keys: jest.fn(),
	values: jest.fn(),
}));

process.env.EXPO_PUBLIC_BASE_API_URL = 'https://www.kicksfolio.app/api/v1';
