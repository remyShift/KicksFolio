import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { useSession } from '@/contexts/authContext';
import { FollowerHandler } from '@/domain/FollowerHandler';
import { UserLookup } from '@/domain/UserLookup';
import useToast from '@/hooks/ui/useToast';
import { followerProxy } from '@/tech/proxy/FollowerProxy';
import { userLookupProxy } from '@/tech/proxy/UserLookupProxy';
import { Sneaker } from '@/types/sneaker';
import { SearchUser } from '@/types/user';

interface UseUserProfile {
	userProfile: UserProfileData | null;
	isFollowLoading: boolean;
	refreshing: boolean;
	hasError: boolean;

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
	const [isFollowLoading, setIsFollowLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasError, setHasError] = useState(false);
	const isLoadingRef = useRef(false);
	const lastLoadedForRef = useRef<string | null>(null);

	const followerHandler = new FollowerHandler(followerProxy);
	const userLookup = new UserLookup(userLookupProxy);

	const loadUserProfile = useCallback(
		async (showRefresh: boolean = false) => {
			if (!userId) {
				console.error(
					'[useUserProfile] loadUserProfile: missing userId'
				);
				setHasError(true);
				return;
			}

			if (isLoadingRef.current && !showRefresh) {
				console.warn(
					'[useUserProfile] loadUserProfile: already loading, skipping'
				);
				return;
			}

			isLoadingRef.current = true;
			setHasError(false);

			if (showRefresh) {
				setRefreshing(true);
			}

			return Promise.all([
				userLookup.getProfile(userId, currentUser?.id ?? ''),
				userLookup.getSneakers(userId),
			])
				.then(([userSearch, sneakers]) => {
					if (userSearch) {
						setUserProfile({
							userSearch,
							sneakers: sneakers || [],
						});
						setHasError(false);
					} else {
						console.warn('[useUserProfile] user not found');
						setHasError(true);
						setUserProfile(null);
					}
				})
				.catch((error) => {
					console.error('Error loading user profile:', error);
					setHasError(true);
					setUserProfile(null);
				})
				.finally(() => {
					isLoadingRef.current = false;
					setRefreshing(false);
				});
		},
		[userId, currentUser?.id]
	);

	const handleFollowToggle = useCallback(async () => {
		if (!userProfile?.userSearch || !currentUser?.id || isFollowLoading)
			return;

		setIsFollowLoading(true);

		const followAction = userProfile.userSearch.is_following
			? followerHandler.unfollow(userProfile.userSearch.id)
			: followerHandler.follow(userProfile.userSearch.id);

		try {
			await followAction;

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

			await Promise.all([refreshFollowingUsers(), refreshUserData()]);
		} catch (error) {
			console.error('Error toggling follow:', error);
			showErrorToast('Error', 'Unable to toggle follow for now.');
		} finally {
			setIsFollowLoading(false);
		}
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
		if (userId && lastLoadedForRef.current !== userId) {
			lastLoadedForRef.current = userId;
			loadUserProfile();
		}
	}, [userId, currentUser?.id]);

	return {
		userProfile,
		isFollowLoading,
		refreshing,
		hasError,
		handleFollowToggle,
		refreshUserProfile,
	};
};
