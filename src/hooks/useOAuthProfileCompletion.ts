import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { useSession } from '@/contexts/authContext';
import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';
import { isProfileComplete } from '@/utils/profileUtils';

export const useOAuthProfileCompletion = () => {
	const { t } = useTranslation();
	const { showSuccessToast } = useToast();
	const { user } = useSession();
	const { getUser } = useAuth();

	const [isUserLoading, setIsUserLoading] = useState(true);
	const [hasCheckedUser, setHasCheckedUser] = useState(false);

	useEffect(() => {
		const checkProfile = async () => {
			if (user && isProfileComplete(user)) {
				showSuccessToast(
					t('auth.login.welcomeBack', { name: user.username }),
					t('auth.login.gladToSeeYou')
				);
				router.replace('/(app)/(tabs)');
			} else if (user) {
				setIsUserLoading(false);
				setHasCheckedUser(true);
			} else if (!hasCheckedUser) {
				try {
					const currentUser = await getUser();
					if (currentUser && !isProfileComplete(currentUser)) {
						setIsUserLoading(false);
					} else if (currentUser && isProfileComplete(currentUser)) {
						router.replace('/(app)/(tabs)');
					}
				} catch (error) {
					setIsUserLoading(false);
				}
				setHasCheckedUser(true);
			} else {
				setIsUserLoading(false);
			}
		};

		const timer = setTimeout(() => {
			checkProfile();
		}, 200);

		return () => clearTimeout(timer);
	}, [user, hasCheckedUser]);

	return {
		isUserLoading,
		user,
	};
};
