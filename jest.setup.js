import 'react-native-gesture-handler/jestSetup';

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

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));


global.fetch = jest.fn(); 