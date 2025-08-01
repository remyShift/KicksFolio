import { AuthProvider } from './AuthProvider';
import { AuthProviderInterface } from '../interfaces/AuthInterface';

class AuthProviderImpl implements AuthProviderInterface {
	signUp = AuthProvider.signUp;
	signIn = AuthProvider.signIn;
	signOut = AuthProvider.signOut;
	getCurrentUser = AuthProvider.getCurrentUser;
	updateProfile = AuthProvider.updateProfile;
	deleteUser = AuthProvider.deleteUser;
	forgotPassword = AuthProvider.forgotPassword;
	resetPassword = AuthProvider.resetPassword;
	resetPasswordWithTokens = AuthProvider.resetPasswordWithTokens;
	cleanupOrphanedSessions = AuthProvider.cleanupOrphanedSessions;
}

export const authProvider = new AuthProviderImpl();
