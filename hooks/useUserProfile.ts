import { useState, useEffect, useCallback, useRef } from 'react';
import { UserSearchProvider, SearchUser } from '@/domain/UserSearchProvider';
import { FollowerProvider } from '@/domain/FollowerProvider';
import { useSession } from '@/context/authContext';
import useToast from '@/hooks/ui/useToast';
import { router } from 'expo-router';
import { Sneaker } from '@/types/Sneaker';
import { useTranslation } from 'react-i18next';

interface UseUserProfile {
	userProfile: UserProfileData | null;
	isLoading: boolean;
	isFollowLoading: boolean;
	refreshing: boolean;

	handleFollowToggle: () => Promise<void>;
	refreshUserProfile: () => Promise<void>;
}

interface UserProfileData {
	userSearch: SearchUser;
	sneakers: Sneaker[];
}

export const useUserProfile = (userId: string | undefined): UseUserProfile => {
	const {
		user: currentUser,
		refreshFollowingUsers,
		refreshUserData,
	} = useSession();
	const { showSuccessToast, showErrorToast } = useToast();
	const { t } = useTranslation();

	const [userProfile, setUserProfile] = useState<UserProfileData | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isFollowLoading, setIsFollowLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const isLoadingRef = useRef(false);

	const loadUserProfile = useCallback(
		async (showRefresh: boolean = false) => {
			if (!userId || !currentUser?.id) {
				return;
			}

			if (isLoadingRef.current && !showRefresh) {
				return;
			}

			isLoadingRef.current = true;

			if (showRefresh) setRefreshing(true);
			else setIsLoading(true);

			try {
				const [userSearch, sneakers] = await Promise.all([
					UserSearchProvider.getUserProfile(userId, currentUser.id),
					UserSearchProvider.getUserSneakers(userId),
				]);

				if (userSearch) {
					setUserProfile({
						userSearch,
						sneakers: sneakers || [],
					});
				} else {
					showErrorToast(
						'Utilisateur introuvable',
						"Cet utilisateur n'existe pas ou n'est plus disponible."
					);
					router.back();
				}
			} catch (error) {
				console.error('Error loading user profile:', error);
				showErrorToast(
					'Erreur de chargement',
					'Impossible de charger le profil utilisateur.'
				);
			} finally {
				isLoadingRef.current = false;
				setIsLoading(false);
				setRefreshing(false);
			}
		},
		[userId, currentUser?.id]
	);

	const handleFollowToggle = useCallback(async () => {
		if (!userProfile?.userSearch || !currentUser?.id || isFollowLoading)
			return;

		setIsFollowLoading(true);

		try {
			if (userProfile.userSearch.is_following) {
				await FollowerProvider.unfollowUser(userProfile.userSearch.id);
				showSuccessToast(
					t('social.unfollowed'),
					t('social.unfollowedDesc', {
						username: userProfile.userSearch.username,
					})
				);
			} else {
				await FollowerProvider.followUser(userProfile.userSearch.id);
				showSuccessToast(
					t('social.followed'),
					t('social.followedDesc', {
						username: userProfile.userSearch.username,
					})
				);
			}

			setUserProfile((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					userSearch: {
						...prev.userSearch,
						is_following: !prev.userSearch.is_following,
						followers_count: prev.userSearch.is_following
							? prev.userSearch.followers_count - 1
							: prev.userSearch.followers_count + 1,
					},
				};
			});

			refreshFollowingUsers().catch((error) => {
				console.warn('Failed to refresh following users:', error);
			});

			refreshUserData().catch((error) => {
				console.warn('Failed to refresh current user data:', error);
			});
		} catch (error) {
			console.error('Error toggling follow:', error);
			showErrorToast(
				'Erreur',
				'Impossible de modifier le suivi pour le moment.'
			);
		} finally {
			setIsFollowLoading(false);
		}
	}, [
		userProfile?.userSearch,
		currentUser?.id,
		isFollowLoading,
		showSuccessToast,
		showErrorToast,
		refreshFollowingUsers,
		refreshUserData,
	]);

	const refreshUserProfile = async () => {
		try {
			await loadUserProfile(true);
		} catch (error) {
			console.error('Error refreshing user profile:', error);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		if (userId && currentUser?.id) {
			loadUserProfile();
		}
	}, [userId, currentUser?.id]);

	return {
		userProfile,
		isLoading,
		isFollowLoading,
		refreshing,
		handleFollowToggle,
		refreshUserProfile,
	};
};
