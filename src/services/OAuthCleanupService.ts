import { supabase } from '@/config/supabase/supabase';
import { isProfileComplete } from '@/utils/profileUtils';

export class OAuthCleanupService {
	static async cleanupIncompleteOAuthAccount(userId: string): Promise<void> {
		try {
			const { error } = await supabase.auth.admin.deleteUser(userId);

			if (error) {
				console.error(
					'❌ OAuthCleanupService: Erreur lors de la suppression:',
					error
				);
				throw error;
			}
		} catch (error) {
			console.error(
				'❌ OAuthCleanupService: Erreur lors du nettoyage:',
				error
			);
			throw error;
		}
	}

	static shouldCleanupOAuthAccount(
		user: any,
		isOAuthProvider: boolean
	): boolean {
		if (!isOAuthProvider || !user) {
			return false;
		}

		const isIncomplete = !isProfileComplete(user);
		const hasNoUserData = !user.username;

		return isIncomplete && hasNoUserData;
	}

	static scheduleCleanup(
		userId: string,
		delayMs: number = 30000
	): NodeJS.Timeout {
		return setTimeout(async () => {
			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error || !user || user.id !== userId) {
					return;
				}

				if (isProfileComplete(user)) {
					return;
				}

				await OAuthCleanupService.cleanupIncompleteOAuthAccount(userId);
			} catch (error) {
				console.error(
					'❌ OAuthCleanupService: Erreur lors du nettoyage planifié:',
					error
				);
			}
		}, delayMs);
	}

	static cancelScheduledCleanup(timeoutId: NodeJS.Timeout): void {
		clearTimeout(timeoutId);
	}
}
