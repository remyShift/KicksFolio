import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { supabase } from '@/config/supabase/supabase';
import { useAuth } from '@/hooks/auth/useAuth';
import { useOAuthCleanup } from '@/hooks/auth/useOAuthCleanup';
import useToast from '@/hooks/ui/useToast';
import { authProxy } from '@/tech/proxy/AuthProxy';
import { OAuthCompletionFormData } from '@/validation/auth';

interface UseOAuthFormSubmissionProps {
	user: any;
	isOAuthUser: boolean;
}

export const useOAuthFormSubmission = ({
	user,
	isOAuthUser,
}: UseOAuthFormSubmissionProps) => {
	const { t } = useTranslation();
	const { updateUser } = useAuth();
	const { showSuccessToast, showErrorToast } = useToast();
	const { cancelCleanup } = useOAuthCleanup(isOAuthUser);

	const [isCompleting, setIsCompleting] = useState(false);

	const handleSubmit = async (data: OAuthCompletionFormData) => {
		let currentUserId = user?.id;
		if (!currentUserId) {
			try {
				const {
					data: { user: authUser },
				} = await supabase.auth.getUser();
				currentUserId = authUser?.id;
			} catch (error) {
				showErrorToast(
					t('auth.oauth.completion.error'),
					'Impossible de récupérer les informations utilisateur'
				);
				return;
			}
		}

		if (!currentUserId) {
			showErrorToast(
				t('auth.oauth.completion.error'),
				'Aucun utilisateur trouvé'
			);
			return;
		}

		setIsCompleting(true);

		try {
			const pendingUser =
				await authProxy.getPendingOAuthUser(currentUserId);

			if (pendingUser) {
				await authProxy.completePendingOAuthUser(currentUserId, {
					username: data.username,
					sneaker_size: Number(data.sneaker_size),
					profile_picture: data.profile_picture,
				});
			} else {
				await updateUser(currentUserId, {
					username: data.username,
					sneaker_size: Number(data.sneaker_size),
					profile_picture: data.profile_picture,
				});
			}

			cancelCleanup();

			showSuccessToast(
				t('auth.signUp.success'),
				t('auth.signUp.successDescription')
			);

			router.replace('/(app)/(tabs)');
		} catch (error: any) {
			console.error('❌ Error completing OAuth profile:', error);
			showErrorToast(
				t('auth.oauth.completion.error'),
				error.message || t('auth.oauth.completion.errorDescription')
			);
		} finally {
			setIsCompleting(false);
		}
	};

	return {
		isCompleting,
		handleSubmit,
	};
};
