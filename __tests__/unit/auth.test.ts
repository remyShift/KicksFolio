import { mockAuth } from '../../__mocks__/api/auth';
import { useSession } from '@/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../context/authContext');
jest.mock('@react-native-async-storage/async-storage');

describe('Authentication Tests', () => {
    const mockUser = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser',
        first_name: 'John',
        last_name: 'Doe',
        sneaker_size: 10,
        profile_picture: ''
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useSession as jest.Mock).mockReturnValue({
            signUp: mockAuth.signUp,
            login: async (email: string, password: string) => {
                const result = await mockAuth.login(email, password);
                await AsyncStorage.setItem('user', JSON.stringify(mockUser));
                return result;
            },
            logout: mockAuth.logout
        });
        jest.mocked(AsyncStorage.setItem).mockClear();
    });

    describe('Sign Up Tests', () => {
        it('devrait créer un nouvel utilisateur avec succès', async () => {
            mockAuth.signUp.mockResolvedValueOnce({ 
                user: mockUser,
                message: 'User created'
            });

            const { signUp } = useSession();
            const result = await signUp(
                mockUser.email,
                mockUser.password,
                mockUser.username,
                mockUser.first_name,
                mockUser.last_name,
                mockUser.sneaker_size,
                mockUser.profile_picture
            );

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('message', 'User created');
            expect(mockAuth.signUp).toHaveBeenCalledWith(
                mockUser.email,
                mockUser.password,
                mockUser.username,
                mockUser.first_name,
                mockUser.last_name,
                mockUser.sneaker_size,
                mockUser.profile_picture
            );
        });

        it('devrait gérer les erreurs lors de l\'inscription', async () => {
            mockAuth.signUp.mockRejectedValueOnce(new Error('Email already exists'));

            const { signUp } = useSession();
            await expect(signUp(
                mockUser.email,
                mockUser.password,
                mockUser.username,
                mockUser.first_name,
                mockUser.last_name,
                mockUser.sneaker_size,
                mockUser.profile_picture
            )).rejects.toThrow('Email already exists');
        });
    });

    describe('Login Tests', () => {
        it('devrait connecter un utilisateur avec succès', async () => {
            const mockToken = 'fake-token';
            mockAuth.login.mockResolvedValueOnce({
                token: mockToken,
                user: mockUser
            });

            const { login } = useSession();
            const result = await login(mockUser.email, mockUser.password);

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
        });

        it('devrait gérer les erreurs de connexion', async () => {
            mockAuth.login.mockRejectedValueOnce(new Error('Invalid credentials'));

            const { login } = useSession();
            await expect(login(mockUser.email, 'wrongpassword'))
                .rejects.toThrow('Invalid credentials');
        });
    });
}); 