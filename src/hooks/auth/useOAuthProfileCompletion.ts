import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { useSession } from '@/contexts/authContext';
import useToast from '@/hooks/ui/useToast';
import { isProfileComplete } from '@/utils/profileUtils';

export const useOAuthProfileCompletion = () => {
	const { t } = useTranslation();
	const { showSuccessToast } = useToast();
	const { user } = useSession();

	useEffect(() => {
		if (user && isProfileComplete(user)) {
			showSuccessToast(
				t('auth.login.welcomeBack', { name: user.username }),
				t('auth.login.gladToSeeYou')
			);
			router.replace('/(app)/(tabs)');
		}
	}, [user]);

	return {
		user,
	};
};
