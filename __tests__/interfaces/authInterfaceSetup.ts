import { SupabaseUser } from '@/domain/AuthProvider';
import { AuthProviderInterface } from '@/interfaces/AuthInterface';

export const mockSupabaseUser: SupabaseUser = {
	id: 'test-user-id',
	email: 'test@example.com',
	username: 'testuser',
	first_name: 'Test',
	last_name: 'User',
	sneaker_size: 42,
	profile_picture: 'test-avatar.jpg',
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z',
	instagram_username: '@testuser',
	social_media_visibility: true,
};

export const mockUserWithStats = {
	...mockSupabaseUser,
	followers_count: 5,
	following_count: 10,
};

export const mockSuccessfulSignUpResponse = {
	user: mockSupabaseUser,
	session: { access_token: 'mock-token', refresh_token: 'mock-refresh' },
};

export const mockSuccessfulSignInResponse = {
	user: { id: 'test-user-id', email: 'test@example.com' },
	session: { access_token: 'mock-token' },
};

export const mockSuccessfulResetPasswordResponse = {
	user: {
		id: '1',
		email: 'test@example.com',
		username: 'testuser',
		first_name: 'John',
		last_name: 'Doe',
		profile_picture_url: '',
		sneaker_size: '10',
	},
};

// Factory functions pour créer des mocks propres

export const createSuccessfulSignUp = () =>
	jest.fn().mockResolvedValue(mockSuccessfulSignUpResponse);

export const createSuccessfulSignIn = () =>
	jest.fn().mockResolvedValue(mockSuccessfulSignInResponse);

export const createSuccessfulSignOut = () =>
	jest.fn().mockResolvedValue(undefined);

export const createSuccessfulGetCurrentUser = () =>
	jest.fn().mockResolvedValue(mockUserWithStats);

export const createSuccessfulUpdateProfile = () =>
	jest.fn().mockResolvedValue({
		...mockSupabaseUser,
		first_name: 'Updated',
	});

export const createSuccessfulDeleteUser = () =>
	jest.fn().mockResolvedValue(true);

export const createSuccessfulForgotPassword = () =>
	jest.fn().mockResolvedValue(undefined);

export const createSuccessfulResetPassword = () =>
	jest.fn().mockResolvedValue(mockSuccessfulResetPasswordResponse);

export const createSuccessfulResetPasswordWithTokens = () =>
	jest.fn().mockResolvedValue(true);

export const createSuccessfulCleanupOrphanedSessions = () =>
	jest.fn().mockResolvedValue(undefined);

export const createFailingMockFunction = (errorMessage: string) =>
	jest.fn().mockRejectedValue(new Error(errorMessage));

export const createMockError = (message: string) => {
	return new Error(message);
};
