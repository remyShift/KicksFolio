import { Session, User, WeakPassword } from '@supabase/supabase-js';

import { UserInfo } from '@/types/user';

export interface AuthProviderInterface {
	signUp: (
		email: string,
		password: string,
		userData: Partial<UserInfo>
	) => Promise<{ user: any; session: Session | null }>;

	signIn: (
		email: string,
		password: string
	) => Promise<{
		user: User;
		session: Session;
		weakPassword?: WeakPassword;
	}>;

	signOut: () => Promise<void>;

	getCurrentUser: () => Promise<
		UserInfo & {
			followers_count: number;
			following_count: number;
		}
	>;

	updateProfile: (
		userId: string,
		userData: Partial<UserInfo>
	) => Promise<UserInfo & { profile_picture_url?: string }>;

	deleteUser: (userId: string) => Promise<boolean>;

	forgotPassword: (email: string) => Promise<void>;

	resetPassword: (newPassword: string) => Promise<{ user: User }>;

	resetPasswordWithTokens: (
		accessToken: string,
		refreshToken: string,
		newPassword: string
	) => Promise<boolean>;

	cleanupOrphanedSessions: () => Promise<void>;
}

export class Auth {
	constructor(private readonly authProvider: AuthProviderInterface) {}

	signUp = async (
		email: string,
		password: string,
		userData: Partial<UserInfo>
	) => {
		return this.authProvider
			.signUp(email, password, userData)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error('❌ Auth.signUp: Error occurred:', error);
				throw error;
			});
	};

	signIn = async (email: string, password: string) => {
		return this.authProvider
			.signIn(email, password)
			.then((response) => {
				return response.user;
			})
			.catch((error) => {
				console.error('❌ Auth.signIn: Error occurred:', error);
				throw error;
			});
	};

	signOut = async () => {
		return this.authProvider
			.signOut()
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error('❌ Auth.signOut: Error occurred:', error);
				throw error;
			});
	};

	getCurrentUser = async () => {
		return this.authProvider
			.getCurrentUser()
			.then((user) => {
				return user;
			})
			.catch((error) => {
				console.error('❌ Auth.getCurrentUser: Error occurred:', error);
				throw error;
			});
	};

	updateProfile = async (userId: string, userData: Partial<UserInfo>) => {
		return this.authProvider
			.updateProfile(userId, userData)
			.then((updatedUser) => {
				return updatedUser;
			})
			.catch((error) => {
				console.error('❌ Auth.updateProfile: Error occurred:', error);
				throw error;
			});
	};

	deleteUser = async (userId: string) => {
		return this.authProvider
			.deleteUser(userId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error('❌ Auth.deleteUser: Error occurred:', error);
				throw error;
			});
	};

	forgotPassword = async (email: string) => {
		return this.authProvider
			.forgotPassword(email)
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error('❌ Auth.forgotPassword: Error occurred:', error);
				throw error;
			});
	};

	resetPassword = async (newPassword: string) => {
		return this.authProvider
			.resetPassword(newPassword)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error('❌ Auth.resetPassword: Error occurred:', error);
				throw error;
			});
	};

	resetPasswordWithTokens = async (
		accessToken: string,
		refreshToken: string,
		newPassword: string
	) => {
		return this.authProvider
			.resetPasswordWithTokens(accessToken, refreshToken, newPassword)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ Auth.resetPasswordWithTokens: Error occurred:',
					error
				);
				throw error;
			});
	};

	cleanupOrphanedSessions = async () => {
		return this.authProvider
			.cleanupOrphanedSessions()
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error(
					'❌ Auth.cleanupOrphanedSessions: Error occurred:',
					error
				);
				throw error;
			});
	};
}
