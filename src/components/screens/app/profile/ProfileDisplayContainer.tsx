import { memo, useCallback, useMemo, useRef, useState } from 'react';

import { unstable_batchedUpdates } from 'react-native';
import { Alert, RefreshControl, ScrollView, Share } from 'react-native';

import { useSession } from '@/contexts/authContext';
import { sneakerFilteringProvider } from '@/d/SneakerFiltering';
import { useShareCollection } from '@/hooks/useShareCollection';
import { useModalStore } from '@/store/useModalStore';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { FilterState } from '@/types/filter';
import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

import { AnonymousUserMessage } from '../../share-collection/AnonymousUserMessage';
import EmptySneakersState from './displayState/EmptySneakersState';
import DualViewContainer from './DualViewContainer';
import ProfileHeader from './ProfileHeader';

interface ProfileDisplayContainerProps {
	user: User | SearchUser;
	userSneakers: Sneaker[];
	refreshing: boolean;
	onRefresh: () => Promise<void>;
	onSneakerPress?: (sneaker: Sneaker) => void;
	showBackButton?: boolean;
	isAnonymousUser?: boolean;
	showSettingsButton?: boolean;
	showAnonymousMessage?: boolean;
	isSharedCollection?: boolean;
}

export default function ProfileDisplayContainer(
	props: ProfileDisplayContainerProps
) {
	const {
		user,
		userSneakers,
		refreshing,
		onRefresh,
		onSneakerPress,
		showBackButton = false,
		isAnonymousUser = false,
		showSettingsButton = false,
		showAnonymousMessage = false,
		isSharedCollection = false,
	} = props;

	const setModalStep = useModalStore((state) => state.setModalStep);
	const setIsVisible = useModalStore((state) => state.setIsVisible);
	const { user: currentUser } = useSession();

	const [currentFilters, setCurrentFilters] = useState<{
		filters: FilterState;
		uniqueValues: any;
	} | null>(null);

	const currentFiltersRef = useRef<{
		filters: FilterState;
		uniqueValues: any;
	} | null>(null);

	const handleFiltersChange = useCallback(
		(filtersData: any) => {
			if (isAnonymousUser) {
				return;
			}

			setCurrentFilters(filtersData);
			currentFiltersRef.current = filtersData;
		},
		[isAnonymousUser]
	);

	const { createShareLink } = useShareCollection(user.id);
	const { currentUnit } = useSizeUnitStore();

	const handleNativeShare = useCallback(async () => {
		try {
			const filtersToUse = currentFiltersRef.current?.filters ||
				currentFilters?.filters || {
					brands: [],
					sizes: [],
					conditions: [],
					statuses: [],
				};

			const sneakersWithoutWishlist = userSneakers.filter(
				(sneaker) => !sneaker.wishlist
			);
			const filteredCount = sneakerFilteringProvider.filterSneakers(
				sneakersWithoutWishlist,
				filtersToUse,
				currentUnit
			);

			const hasFilters =
				filtersToUse.brands.length > 0 ||
				filtersToUse.sizes.length > 0 ||
				filtersToUse.conditions.length > 0 ||
				filtersToUse.statuses.length > 0;

			const filterDescription = hasFilters
				? `Filtered collection (${filteredCount.length} sneakers)`
				: `Complete collection (${filteredCount.length} sneakers)`;

			const shareCollection = async () => {
				const response = await createShareLink(filtersToUse);

				await Share.share({
					message: `Check out @${user.username}'s sneaker collection on KicksFolio! 🔥\n\n${filterDescription}\n\n${response.url}`,
					title: `@${user.username}'s Sneaker Collection - KicksFolio`,
				});
			};

			if (hasFilters) {
				Alert.alert(
					'Filters Active',
					`You have filters applied to your collection. Only ${filteredCount.length} sneakers matching your filters will be shared.\n\nDo you want to continue?`,
					[
						{
							text: 'Cancel',
							style: 'cancel',
						},
						{
							text: 'Share',
							onPress: shareCollection,
						},
					]
				);
			} else {
				await shareCollection();
			}
		} catch (error) {
			console.error('Error sharing collection:', error);
		}
	}, [
		currentFilters,
		createShareLink,
		userSneakers,
		currentUnit,
		user.username,
	]);

	const handleAddSneaker = useCallback(() => {
		unstable_batchedUpdates(() => {
			useModalStore.getState().resetModalData();
			setModalStep('index');
			setIsVisible(true);
		});
	}, [setModalStep, setIsVisible]);

	const memoizedProfileHeader = useMemo(() => {
		return (
			<ProfileHeader
				user={user}
				userSneakers={userSneakers}
				showBackButton={showBackButton}
				onSharePress={handleNativeShare}
				isAnonymousUser={isAnonymousUser}
				showSettingsButton={showSettingsButton}
				isSharedCollection={isSharedCollection}
			/>
		);
	}, [
		user,
		userSneakers,
		showBackButton,
		handleNativeShare,
		isAnonymousUser,
		showSettingsButton,
		isSharedCollection,
	]);

	const handleRefresh = useCallback(async () => {
		await onRefresh();
	}, [onRefresh]);

	if (userSneakers.length === 0) {
		return (
			<ScrollView
				className="flex-1 mt-16"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor="#FF6B6B"
						progressViewOffset={60}
						testID="refresh-control"
					/>
				}
			>
				{memoizedProfileHeader}
				<EmptySneakersState
					onAddPress={handleAddSneaker}
					showAddButton={user.id === currentUser?.id}
				/>
			</ScrollView>
		);
	}

	return (
		<>
			<ScrollView
				className="flex-1 mt-16"
				testID="scroll-view"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor="#FF6B6B"
						progressViewOffset={60}
						testID="refresh-control"
					/>
				}
			>
				{memoizedProfileHeader}
				{showAnonymousMessage && <AnonymousUserMessage />}
				<DualViewContainer
					userSneakers={userSneakers}
					onSneakerPress={onSneakerPress}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					onFiltersChange={handleFiltersChange}
					isAnonymousUser={isAnonymousUser}
				/>
			</ScrollView>
		</>
	);
}
