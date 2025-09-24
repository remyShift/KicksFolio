import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';
import { useOAuthCleanup } from '@/hooks/useOAuthCleanup';
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
	const { updateUser, getUser } = useAuth();
	const { showSuccessToast, showErrorToast } = useToast();
	const { cancelCleanup } = useOAuthCleanup(isOAuthUser);

	const [isCompleting, setIsCompleting] = useState(false);

	const handleSubmit = async (data: OAuthCompletionFormData) => {
		let currentUserId = user?.id;
		if (!currentUserId) {
			try {
				const currentUser = await getUser();
				currentUserId = currentUser?.id;
			} catch (error) {
				showErrorToast(
					t('auth.oauth.completion.error'),
					'Impossible de récupérer les informations utilisateur'
				);
				return;
			}
		}

		setIsCompleting(true);

		try {
			await updateUser(currentUserId!, {
				username: data.username,
				sneaker_size: Number(data.sneaker_size),
				profile_picture: data.profile_picture,
			});

			cancelCleanup();

			showSuccessToast(
				t('auth.oauth.completion.success'),
				t('auth.oauth.completion.successDescription')
			);

			router.replace('/(app)/(tabs)');
		} catch (error: any) {
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
