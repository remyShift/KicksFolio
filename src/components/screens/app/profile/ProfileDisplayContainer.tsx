import { memo, useCallback, useMemo, useState } from 'react';

import { RefreshControl, ScrollView, Share } from 'react-native';

import { useSession } from '@/contexts/authContext';
import { useShareCollection } from '@/hooks/useShareCollection';
import { useModalStore } from '@/store/useModalStore';
import { FilterState } from '@/types/filter';
import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

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
	} = props;

	const { setModalStep, setIsVisible } = useModalStore();
	const { user: currentUser } = useSession();

	const [currentFilters, setCurrentFilters] = useState<{
		filters: FilterState;
		uniqueValues: any;
	} | null>(null);

	const handleFiltersChange = useCallback(
		(filtersData: any) => {
			if (isAnonymousUser) {
				return;
			}
			setCurrentFilters(filtersData);
		},
		[isAnonymousUser]
	);

	const { createShareLink } = useShareCollection(user.id);

	const handleNativeShare = useCallback(async () => {
		try {
			const filtersToUse = currentFilters?.filters || {
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			};

			const response = await createShareLink(filtersToUse);

			const filteredCount = userSneakers.filter((sneaker) => {
				if (
					!filtersToUse.brands.length &&
					!filtersToUse.sizes.length &&
					!filtersToUse.conditions.length &&
					!filtersToUse.statuses.length
				) {
					return !sneaker.wishlist;
				}

				let matches = true;
				if (filtersToUse.brands.length > 0) {
					matches =
						matches &&
						filtersToUse.brands.includes(sneaker.brand?.name || '');
				}
				return matches && !sneaker.wishlist;
			});

			const hasFilters =
				filtersToUse.brands.length > 0 ||
				filtersToUse.sizes.length > 0 ||
				filtersToUse.conditions.length > 0 ||
				filtersToUse.statuses.length > 0;

			const filterDescription = hasFilters
				? `Filtered collection (${filteredCount.length} sneakers)`
				: `Complete collection (${filteredCount.length} sneakers)`;

			await Share.share({
				message: `Check out this sneaker collection: ${response.url}`,
				title: filterDescription,
			});
		} catch (error) {
			console.error('Error sharing collection:', error);
		}
	}, [currentFilters, createShareLink, userSneakers]);

	const handleAddSneaker = useCallback(() => {
		setModalStep('index');
		setIsVisible(true);
	}, [setModalStep, setIsVisible]);

	const memoizedProfileHeader = useMemo(() => {
		return (
			<ProfileHeader
				user={user}
				userSneakers={userSneakers}
				showBackButton={showBackButton}
				onSharePress={handleNativeShare}
				isAnonymousUser={isAnonymousUser}
			/>
		);
	}, [
		user,
		userSneakers,
		showBackButton,
		handleNativeShare,
		isAnonymousUser,
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
				<EmptySneakersState onAddPress={handleAddSneaker} />
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
