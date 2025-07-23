import { useState, useEffect, useCallback } from 'react';
import { UserSearchService, SearchUser } from '@/services/UserSearchService';
import { FollowerService } from '@/services/FollowerService';
import { useSession } from '@/context/authContext';
import useToast from '@/hooks/useToast';
import { router } from 'expo-router';

interface UseUserProfileReturn {
	// State
	userProfile: UserProfileData | null;
	isLoading: boolean;
	isFollowLoading: boolean;
	refreshing: boolean;

	// Actions
	handleFollowToggle: () => Promise<void>;
	onRefresh: () => void;
}

interface UserProfileData {
	profile: SearchUser;
	sneakers: any[];
}

export const useUserProfile = (
	userId: string | undefined
): UseUserProfileReturn => {
	const { user: currentUser } = useSession();
	const { showSuccessToast, showErrorToast } = useToast();

	const [userProfile, setUserProfile] = useState<UserProfileData | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isFollowLoading, setIsFollowLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const loadUserProfile = useCallback(
		async (showRefresh: boolean = false) => {
			if (!userId || !currentUser?.id) return;

			if (showRefresh) setRefreshing(true);
			else setIsLoading(true);

			try {
				const [profile, sneakers] = await Promise.all([
					UserSearchService.getUserProfile(userId, currentUser.id),
					UserSearchService.getUserSneakers(userId),
				]);

				if (profile) {
					setUserProfile({
						profile,
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
				setIsLoading(false);
				setRefreshing(false);
			}
		},
		[userId, currentUser?.id, showErrorToast]
	);

	const handleFollowToggle = useCallback(async () => {
		if (!userProfile?.profile || !currentUser?.id || isFollowLoading)
			return;

		setIsFollowLoading(true);

		try {
			if (userProfile.profile.is_following) {
				await FollowerService.unfollowUser(userProfile.profile.id);
				showSuccessToast(
					'Désabonné',
					`Vous ne suivez plus @${userProfile.profile.username}`
				);
			} else {
				await FollowerService.followUser(userProfile.profile.id);
				showSuccessToast(
					'Abonné',
					`Vous suivez maintenant @${userProfile.profile.username}`
				);
			}

			// Update local state optimistically
			setUserProfile((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					profile: {
						...prev.profile,
						is_following: !prev.profile.is_following,
						followers_count: prev.profile.is_following
							? prev.profile.followers_count - 1
							: prev.profile.followers_count + 1,
					},
				};
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
		userProfile?.profile,
		currentUser?.id,
		isFollowLoading,
		showSuccessToast,
		showErrorToast,
	]);

	const onRefresh = useCallback(() => {
		loadUserProfile(true);
	}, [loadUserProfile]);

	useEffect(() => {
		loadUserProfile();
	}, [loadUserProfile]);

	return {
		userProfile,
		isLoading,
		isFollowLoading,
		refreshing,
		handleFollowToggle,
		onRefresh,
	};
};
