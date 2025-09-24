import { useEffect, useRef } from 'react';

import { useRouter } from 'expo-router';

import { useSession } from '@/contexts/authContext';
import { OAuthCleanupService } from '@/services/OAuthCleanupService';

export const useOAuthCleanup = (isOAuthUser: boolean) => {
	const { user } = useSession();
	const router = useRouter();
	const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!isOAuthUser || !user) {
			return;
		}

		const shouldCleanup = OAuthCleanupService.shouldCleanupOAuthAccount(
			user,
			isOAuthUser
		);

		if (shouldCleanup) {
			cleanupTimeoutRef.current = OAuthCleanupService.scheduleCleanup(
				user.id
			);
		}

		return () => {
			if (cleanupTimeoutRef.current) {
				OAuthCleanupService.cancelScheduledCleanup(
					cleanupTimeoutRef.current
				);
				cleanupTimeoutRef.current = null;
			}
		};
	}, [user, isOAuthUser]);

	const cancelCleanup = () => {
		if (cleanupTimeoutRef.current) {
			OAuthCleanupService.cancelScheduledCleanup(
				cleanupTimeoutRef.current
			);
			cleanupTimeoutRef.current = null;
		}
	};

	const forceCleanup = async () => {
		if (user && isOAuthUser) {
			try {
				await OAuthCleanupService.cleanupIncompleteOAuthAccount(
					user.id
				);
				router.replace('/(auth)/welcome');
			} catch (error) {}
		}
	};

	return {
		cancelCleanup,
		forceCleanup,
	};
};
