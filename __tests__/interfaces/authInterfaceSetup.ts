import { vi } from 'vitest';
import { SupabaseUser } from '@/domain/AuthProvider';

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
	vi.fn().mockResolvedValue(mockSuccessfulSignUpResponse);

export const createSuccessfulSignIn = () =>
	vi.fn().mockResolvedValue(mockSuccessfulSignInResponse);

export const createSuccessfulSignOut = () =>
	vi.fn().mockResolvedValue(undefined);

export const createSuccessfulGetCurrentUser = () =>
	vi.fn().mockResolvedValue(mockUserWithStats);

export const createSuccessfulUpdateProfile = () =>
	vi.fn().mockResolvedValue({
		...mockSupabaseUser,
		first_name: 'Updated',
	});

export const createSuccessfulDeleteUser = () => vi.fn().mockResolvedValue(true);

export const createSuccessfulForgotPassword = () =>
	vi.fn().mockResolvedValue(undefined);

export const createSuccessfulResetPassword = () =>
	vi.fn().mockResolvedValue(mockSuccessfulResetPasswordResponse);

export const createSuccessfulResetPasswordWithTokens = () =>
	vi.fn().mockResolvedValue(true);

export const createSuccessfulCleanupOrphanedSessions = () =>
	vi.fn().mockResolvedValue(undefined);

export const createFailingMockFunction = (errorMessage: string) =>
	vi.fn().mockRejectedValue(new Error(errorMessage));

export const createMockError = (message: string) => {
	return new Error(message);
};
