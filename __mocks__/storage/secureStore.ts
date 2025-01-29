const store = new Map();

export const mockSecureStore = {
    setItemAsync: jest.fn((key, value) => {
        store.set(key, value);
        return Promise.resolve();
    }),
    getItemAsync: jest.fn((key) => {
        return Promise.resolve(store.get(key));
    }),
    deleteItemAsync: jest.fn((key) => {
        store.delete(key);
        return Promise.resolve();
    })
}; 