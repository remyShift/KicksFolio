import { supabase } from '@/config/supabase/supabase';
import { isProfileComplete } from '@/utils/profileUtils';

export class OAuthCleanupService {
	static async cleanupIncompleteOAuthAccount(userId: string): Promise<void> {
		try {
			console.log(
				'🧹 OAuthCleanupService: Nettoyage du compte incomplet:',
				userId
			);

			const { error } = await supabase.auth.admin.deleteUser(userId);

			if (error) {
				console.error(
					'❌ OAuthCleanupService: Erreur lors de la suppression:',
					error
				);
				throw error;
			}

			console.log(
				'✅ OAuthCleanupService: Compte OAuth incomplet nettoyé avec succès'
			);
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
		console.log(
			`⏰ OAuthCleanupService: Nettoyage planifié dans ${delayMs}ms pour:`,
			userId
		);

		return setTimeout(async () => {
			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error || !user || user.id !== userId) {
					console.log(
						'🚫 OAuthCleanupService: Utilisateur introuvable ou différent, annulation du nettoyage'
					);
					return;
				}

				if (isProfileComplete(user)) {
					console.log(
						'✅ OAuthCleanupService: Profil maintenant complet, annulation du nettoyage'
					);
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
		console.log('🚫 OAuthCleanupService: Nettoyage planifié annulé');
	}
}
