import 'react-native-gesture-handler/jestSetup';
import { mockAuth } from './__mocks__/api/auth';
import { mockSecureStore } from './__mocks__/storage/secureStore';

jest.mock('@react-native-async-storage/async-storage', () => {
    const mockAsyncStorage = {
        setItem: jest.fn(() => Promise.resolve()),
        getItem: jest.fn(() => Promise.resolve(null)),
        removeItem: jest.fn(() => Promise.resolve()),
        clear: jest.fn(() => Promise.resolve()),
        getAllKeys: jest.fn(() => Promise.resolve([]))
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

global.fetch = jest.fn(); 