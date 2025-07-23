import { useState, useEffect, useCallback, useRef } from 'react';
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

	console.log('🔑 [useUserProfile] Hook initialized', {
		userId,
		hasCurrentUser: !!currentUser,
		currentUserId: currentUser?.id,
	});

	const [userProfile, setUserProfile] = useState<UserProfileData | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isFollowLoading, setIsFollowLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const isLoadingRef = useRef(false); // Protection contre les appels multiples

	const loadUserProfile = useCallback(
		async (showRefresh: boolean = false) => {
			console.log('🔄 [useUserProfile] loadUserProfile started', {
				userId,
				currentUserId: currentUser?.id,
				showRefresh,
				isAlreadyLoading: isLoadingRef.current,
			});

			if (!userId || !currentUser?.id) {
				console.log(
					'❌ [useUserProfile] Missing userId or currentUser',
					{
						userId,
						currentUserId: currentUser?.id,
					}
				);
				return;
			}

			// Éviter les appels multiples simultanés
			if (isLoadingRef.current && !showRefresh) {
				console.log('⚠️ [useUserProfile] Already loading, skipping...');
				return;
			}

			isLoadingRef.current = true;

			if (showRefresh) setRefreshing(true);
			else setIsLoading(true);

			try {
				console.log('📡 [useUserProfile] Calling UserSearchService...');

				const [profile, sneakers] = await Promise.all([
					UserSearchService.getUserProfile(userId, currentUser.id),
					UserSearchService.getUserSneakers(userId),
				]);

				console.log('✅ [useUserProfile] API calls completed', {
					profile: profile ? 'Found' : 'Not found',
					sneakersCount: sneakers?.length || 0,
				});

				if (profile) {
					setUserProfile({
						profile,
						sneakers: sneakers || [],
					});
					console.log(
						'✅ [useUserProfile] User profile set successfully'
					);
				} else {
					console.log(
						'❌ [useUserProfile] Profile is null, showing error'
					);
					showErrorToast(
						'Utilisateur introuvable',
						"Cet utilisateur n'existe pas ou n'est plus disponible."
					);
					router.back();
				}
			} catch (error) {
				console.error(
					'❌ [useUserProfile] Error loading user profile:',
					error
				);
				showErrorToast(
					'Erreur de chargement',
					'Impossible de charger le profil utilisateur.'
				);
			} finally {
				console.log(
					'🏁 [useUserProfile] Loading finished, setting states to false'
				);
				isLoadingRef.current = false;
				setIsLoading(false);
				setRefreshing(false);
			}
		},
		[userId, currentUser?.id] // Suppression de showErrorToast des dépendances
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
		console.log(
			'🚀 [useUserProfile] useEffect triggered, calling loadUserProfile'
		);
		if (userId && currentUser?.id) {
			loadUserProfile();
		}
	}, [userId, currentUser?.id]); // Dépendances simplifiées pour éviter la boucle infinie

	return {
		userProfile,
		isLoading,
		isFollowLoading,
		refreshing,
		handleFollowToggle,
		onRefresh,
	};
};
