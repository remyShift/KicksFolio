import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { useSession } from '@/contexts/authContext';
import { followerProvider } from '@/domain/FollowerProvider';
import { SearchUser } from '@/domain/UserSearchProvider';
import { userSearchProvider } from '@/domain/UserSearchProvider';
import useToast from '@/hooks/ui/useToast';
import { FollowerInterface } from '@/interfaces/FollowerInterface';
import { UserSearchInterface } from '@/interfaces/UserSearchInterface';
import { Sneaker } from '@/types/sneaker';

interface UseUserProfile {
	userProfile: UserProfileData | null;
	isLoading: boolean;
	isFollowLoading: boolean;
	refreshing: boolean;

	handleFollowToggle: () => Promise<void | [void, void]>;
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

			return Promise.all([
				UserSearchInterface.getUserProfile(
					userId,
					currentUser.id,
					userSearchProvider.getUserProfile
				),
				UserSearchInterface.getUserSneakers(
					userId,
					userSearchProvider.getUserSneakers
				),
			])
				.then(([userSearch, sneakers]) => {
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
				})
				.catch((error) => {
					console.error('Error loading user profile:', error);
					showErrorToast(
						'Erreur de chargement',
						'Impossible de charger le profil utilisateur.'
					);
				})
				.finally(() => {
					isLoadingRef.current = false;
					setIsLoading(false);
					setRefreshing(false);
				});
		},
		[userId, currentUser?.id, showErrorToast]
	);

	const handleFollowToggle = useCallback(() => {
		if (!userProfile?.userSearch || !currentUser?.id || isFollowLoading)
			return Promise.resolve();

		setIsFollowLoading(true);

		const followAction = userProfile.userSearch.is_following
			? FollowerInterface.unfollowUser(
					userProfile.userSearch.id,
					followerProvider.unfollowUser
				)
			: FollowerInterface.followUser(
					userProfile.userSearch.id,
					followerProvider.followUser
				);

		return followAction
			.then(() => {
				const isUnfollowing = userProfile.userSearch.is_following;

				if (isUnfollowing) {
					showSuccessToast(
						t('social.unfollowed'),
						t('social.unfollowedDesc', {
							username: userProfile.userSearch.username,
						})
					);
				} else {
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

				return Promise.all([
					refreshFollowingUsers(),
					refreshUserData(),
				]);
			})
			.catch((error) => {
				console.error('Error toggling follow:', error);
				showErrorToast(
					'Erreur',
					'Impossible de modifier le suivi pour le moment.'
				);
			})
			.finally(() => {
				setIsFollowLoading(false);
			});
	}, [
		userProfile?.userSearch,
		currentUser?.id,
		isFollowLoading,
		showSuccessToast,
		showErrorToast,
		t,
		refreshFollowingUsers,
		refreshUserData,
	]);

	const refreshUserProfile = useCallback(() => {
		return loadUserProfile(true).catch((error) => {
			console.error('Error refreshing user profile:', error);
			setRefreshing(false);
		});
	}, [loadUserProfile]);

	useEffect(() => {
		if (userId && currentUser?.id) {
			loadUserProfile();
		}
	}, [userId, currentUser?.id, loadUserProfile]);

	return {
		userProfile,
		isLoading,
		isFollowLoading,
		refreshing,
		handleFollowToggle,
		refreshUserProfile,
	};
};
