import { mockAuth } from '../../__mocks__/api/auth';
import { useSession } from '@/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUser } from '../../__mocks__/api/user';
import { User } from '@/types/Models';

const typedMockUser: User = {
    ...mockUser,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    friends: [],
    profile_picture: {
        id: '1',
        url: mockUser.profile_picture || ''
    },
    profile_picture_url: mockUser.profile_picture || '',
    collection: {
        id: '1',
        name: 'My Collection',
        user_id: '1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
    },
    sneakers: []
};

const mockUseSession = jest.fn(() => ({
    user: typedMockUser,
    signUp: mockAuth.signUp,
    login: async (email: string, password: string) => {
        const result = await mockAuth.login(email, password);
        await AsyncStorage.setItem('user', JSON.stringify(typedMockUser));
        return result;
    },
    logout: mockAuth.logout,
    updateUser: async (user: User, profileData: any, token: string) => {
        const result = await mockAuth.updateUser(user, profileData, token);
        if (result.user) {
            await AsyncStorage.setItem('user', JSON.stringify(result.user));
        }
        return result;
    },
    deleteAccount: async (userId: string, token: string) => {
        const result = await mockAuth.deleteAccount(userId, token);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('sessionToken');
        return result;
    }
}));

jest.mock('../../context/authContext', () => ({
    useSession: () => mockUseSession()
}));

jest.mock('@react-native-async-storage/async-storage');

describe('Authentication Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(AsyncStorage.setItem).mockClear();
        jest.mocked(AsyncStorage.removeItem).mockClear();
        jest.mocked(AsyncStorage.setItem).mockImplementation(() => Promise.resolve());
        jest.mocked(AsyncStorage.removeItem).mockImplementation(() => Promise.resolve());
    });

    describe('Sign Up Tests', () => {
        it('should create a new user successfully', async () => {
            mockAuth.signUp.mockResolvedValueOnce({ 
                user: typedMockUser,
                message: 'User created'
            });

            const { signUp } = useSession();
            const result = await signUp(
                typedMockUser.email,
                typedMockUser.password,
                typedMockUser.username,
                typedMockUser.first_name,
                typedMockUser.last_name,
                typedMockUser.sneaker_size,
                typedMockUser.profile_picture.url
            );

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('message', 'User created');
            expect(mockAuth.signUp).toHaveBeenCalledWith(
                typedMockUser.email,
                typedMockUser.password,
                typedMockUser.username,
                typedMockUser.first_name,
                typedMockUser.last_name,
                typedMockUser.sneaker_size,
                typedMockUser.profile_picture.url
            );
        });

        it('should handle errors during signup', async () => {
            mockAuth.signUp.mockRejectedValueOnce(new Error('Email already exists'));

            const { signUp } = useSession();
            await expect(signUp(
                typedMockUser.email,
                typedMockUser.password,
                typedMockUser.username,
                typedMockUser.first_name,
                typedMockUser.last_name,
                typedMockUser.sneaker_size,
                typedMockUser.profile_picture.url
            )).rejects.toThrow('Email already exists');
        });
    });

    describe('Login Tests', () => {
        it('should log in a user successfully', async () => {
            const mockToken = 'fake-token';
            mockAuth.login.mockResolvedValueOnce({
                token: mockToken,
                user: typedMockUser
            });

            const { login } = useSession();
            const result = await login(typedMockUser.email, typedMockUser.password);

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(typedMockUser));
        });

        it('should handle login errors', async () => {
            mockAuth.login.mockRejectedValueOnce(new Error('Invalid credentials'));

            const { login } = useSession();
            await expect(login(typedMockUser.email, 'wrongpassword'))
                .rejects.toThrow('Invalid credentials');
        });
    });

    describe('Account Management Tests', () => {
        describe('Delete Account Tests', () => {
            it('should delete account successfully', async () => {
                mockAuth.deleteAccount.mockResolvedValueOnce({
                    message: 'Account deleted successfully'
                });

                const { deleteAccount } = useSession();
                const result = await deleteAccount(typedMockUser.id, 'fake-token');

                expect(result).toHaveProperty('message', 'Account deleted successfully');
                expect(mockAuth.deleteAccount).toHaveBeenCalledWith(typedMockUser.id, 'fake-token');
                expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(1, 'user');
                expect(AsyncStorage.removeItem).toHaveBeenNthCalledWith(2, 'sessionToken');
            });

            it('should handle errors during account deletion', async () => {
                mockAuth.deleteAccount.mockRejectedValueOnce(new Error('Unauthorized'));

                const { deleteAccount } = useSession();
                await expect(deleteAccount(typedMockUser.id, 'invalid-token'))
                    .rejects.toThrow('Unauthorized');
            });
        });

        describe('Update Profile Tests', () => {
            const updatedData = {
                newUsername: 'newuser',
                newFirstName: 'Jane',
                newLastName: 'Smith',
                newSneakerSize: 11,
                newEmail: 'new@example.com',
                newProfilePicture: 'new-picture.jpg'
            };

            it('should update user profile successfully', async () => {
                const updatedUser = { ...typedMockUser, ...updatedData };
                mockAuth.updateUser.mockResolvedValueOnce({
                    user: updatedUser,
                    message: 'Profile updated successfully'
                });

                const { updateUser } = useSession();
                const result = await updateUser(typedMockUser, updatedData, 'fake-token');

                expect(result.user).toMatchObject(updatedUser);
                expect(mockAuth.updateUser).toHaveBeenCalledWith(typedMockUser, updatedData, 'fake-token');
                expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(result.user));
            });

            it('should handle validation errors during update', async () => {
                mockAuth.updateUser.mockRejectedValueOnce(new Error('Invalid sneaker size'));

                const { updateUser } = useSession();
                const invalidData = { ...updatedData, newSneakerSize: 0 };
                
                await expect(updateUser(typedMockUser, invalidData, 'fake-token'))
                    .rejects.toThrow('Invalid sneaker size');
            });

            it('should handle profile picture update', async () => {
                const dataWithPicture = {
                    ...updatedData,
                    newProfilePicture: 'data:image/jpeg;base64,fake-image-data'
                };
                const updatedUser = { 
                    ...typedMockUser, 
                    profile_picture: { url: dataWithPicture.newProfilePicture }
                };

                mockAuth.updateUser.mockResolvedValueOnce({
                    user: updatedUser,
                    message: 'Profile updated successfully'
                });

                const { updateUser } = useSession();
                const result = await updateUser(typedMockUser, dataWithPicture, 'fake-token');

                expect(result.user.profile_picture.url).toBe(dataWithPicture.newProfilePicture);
            });
        });
    });

    describe('Session Management', () => {
        it('should persist user data correctly', async () => {
            const { login } = useSession();
            const userData = {
                email: 'test@example.com',
                password: 'Password123'
            };

            await login(userData.email, userData.password);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'user',
                expect.any(String)
            );
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'tokens',
                expect.any(String)
            );
        });
    });
}); 