const mockUserData = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
};

const mockTokens = {
    access: 'fake-access-token',
};

export const mockAuth = {
    login: jest.fn().mockImplementation(async (email: string, password: string) => {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        if (email === 'error@test.com') {
            throw new Error('Invalid credentials');
        }

        return {
            user: mockUserData,
            tokens: mockTokens
        };
    }),

    signUp: jest.fn().mockImplementation(async (userData: any) => {
        if (!userData.email || !userData.password) {
            throw new Error('Missing required fields');
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        if (userData.email === 'existing@test.com') {
            throw new Error('Email already exists');
        }

        return {
            user: { ...mockUserData, ...userData },
            tokens: mockTokens
        };
    }),

    logout: jest.fn().mockImplementation(async (token: string) => {
        if (!token) {
            throw new Error('Token is required');
        }
        return { success: true };
    }),

    updateUser: jest.fn(),
    checkEmail: jest.fn(),
    checkUsername: jest.fn(),
    deleteAccount: jest.fn(),
}; 