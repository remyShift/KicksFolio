import { Session, User, WeakPassword } from '@supabase/supabase-js';

import { SupabaseUser } from '../domain/AuthProvider';

export interface AuthProviderInterface {
	signUp: (
		email: string,
		password: string,
		userData: Partial<SupabaseUser>
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
		SupabaseUser & {
			followers_count: number;
			following_count: number;
		}
	>;

	updateProfile: (
		userId: string,
		userData: Partial<SupabaseUser>
	) => Promise<SupabaseUser & { profile_picture_url?: string }>;

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

export class AuthInterface {
	static signUp = async (
		email: string,
		password: string,
		userData: Partial<SupabaseUser>,
		signUpFunction: AuthProviderInterface['signUp']
	) => {
		return signUpFunction(email, password, userData)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.signUp: Error occurred:',
					error
				);
				throw error;
			});
	};

	static signIn = async (
		email: string,
		password: string,
		signInFunction: AuthProviderInterface['signIn']
	) => {
		return signInFunction(email, password)
			.then((response) => {
				return response.user;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.signIn: Error occurred:',
					error
				);
				throw error;
			});
	};

	static signOut = async (
		signOutFunction: AuthProviderInterface['signOut']
	) => {
		return signOutFunction()
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.signOut: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getCurrentUser = async (
		getCurrentUserFunction: AuthProviderInterface['getCurrentUser']
	) => {
		return getCurrentUserFunction()
			.then((user) => {
				return user;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.getCurrentUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	static updateProfile = async (
		userId: string,
		userData: Partial<SupabaseUser>,
		updateProfileFunction: AuthProviderInterface['updateProfile']
	) => {
		return updateProfileFunction(userId, userData)
			.then((updatedUser) => {
				return updatedUser;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.updateProfile: Error occurred:',
					error
				);
				throw error;
			});
	};

	static deleteUser = async (
		userId: string,
		deleteUserFunction: AuthProviderInterface['deleteUser']
	) => {
		return deleteUserFunction(userId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.deleteUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	static forgotPassword = async (
		email: string,
		forgotPasswordFunction: AuthProviderInterface['forgotPassword']
	) => {
		return forgotPasswordFunction(email)
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.forgotPassword: Error occurred:',
					error
				);
				throw error;
			});
	};

	static resetPassword = async (
		newPassword: string,
		resetPasswordFunction: AuthProviderInterface['resetPassword']
	) => {
		return resetPasswordFunction(newPassword)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.resetPassword: Error occurred:',
					error
				);
				throw error;
			});
	};

	static resetPasswordWithTokens = async (
		accessToken: string,
		refreshToken: string,
		newPassword: string,
		resetPasswordWithTokensFunction: AuthProviderInterface['resetPasswordWithTokens']
	) => {
		return resetPasswordWithTokensFunction(
			accessToken,
			refreshToken,
			newPassword
		)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.resetPasswordWithTokens: Error occurred:',
					error
				);
				throw error;
			});
	};

	static cleanupOrphanedSessions = async (
		cleanupOrphanedSessionsFunction: AuthProviderInterface['cleanupOrphanedSessions']
	) => {
		return cleanupOrphanedSessionsFunction()
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error(
					'❌ AuthInterface.cleanupOrphanedSessions: Error occurred:',
					error
				);
				throw error;
			});
	};
}
