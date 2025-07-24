import { useState, useEffect, useCallback, useRef } from 'react';
import { UserSearchService, SearchUser } from '@/services/UserSearchService';
import { FollowerService } from '@/services/FollowerService';
import { useSession } from '@/context/authContext';
import useToast from '@/hooks/useToast';
import { router } from 'expo-router';
import { Sneaker } from '@/types/Sneaker';

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
	const { user: currentUser } = useSession();
	const { showSuccessToast, showErrorToast } = useToast();

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
				console.log(
					'🚫 [useUserProfile] Missing userId or currentUser.id:',
					{ userId, currentUserId: currentUser?.id }
				);
				return;
			}

			if (isLoadingRef.current && !showRefresh) {
				console.log('⏸️ [useUserProfile] Already loading, skipping');
				return;
			}

			isLoadingRef.current = true;
			console.log(
				'🔄 [useUserProfile] Loading user profile for:',
				userId
			);

			if (showRefresh) setRefreshing(true);
			else setIsLoading(true);

			try {
				console.log(
					'📡 [useUserProfile] Fetching user profile and sneakers...'
				);
				const [userSearch, sneakers] = await Promise.all([
					UserSearchService.getUserProfile(userId, currentUser.id),
					UserSearchService.getUserSneakers(userId),
				]);

				console.log('📊 [useUserProfile] Data received:', {
					userProfile: !!userSearch,
					sneakersCount: sneakers?.length || 0,
					userId,
					userSearch: userSearch
						? {
								id: userSearch.id,
								username: userSearch.username,
								followers_count: userSearch.followers_count,
								following_count: userSearch.following_count,
						  }
						: null,
				});

				if (userSearch) {
					const profileData = {
						userSearch,
						sneakers: sneakers || [],
					};

					console.log(
						'✅ [useUserProfile] Setting user profile data:',
						{
							userId: userSearch.id,
							username: userSearch.username,
							sneakersCount: profileData.sneakers.length,
							sneakersPreview: profileData.sneakers
								.slice(0, 3)
								.map((s) => ({
									id: s.id,
									model: s.model,
									brand: s.brand,
								})),
						}
					);

					setUserProfile(profileData);
				} else {
					console.warn(
						'⚠️ [useUserProfile] User profile not found for userId:',
						userId
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
				isLoadingRef.current = false;
				setIsLoading(false);
				setRefreshing(false);
				console.log('🏁 [useUserProfile] Loading completed');
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
				await FollowerService.unfollowUser(userProfile.userSearch.id);
				showSuccessToast(
					'Désabonné',
					`Vous ne suivez plus @${userProfile.userSearch.username}`
				);
			} else {
				await FollowerService.followUser(userProfile.userSearch.id);
				showSuccessToast(
					'Abonné',
					`Vous suivez maintenant @${userProfile.userSearch.username}`
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
	]);

	const refreshUserProfile = async () => {
		await loadUserProfile(true);
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
