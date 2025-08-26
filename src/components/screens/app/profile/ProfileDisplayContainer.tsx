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
	} = props;

	const { setModalStep, setIsVisible } = useModalStore();
	const { user: currentUser } = useSession();

	const [currentFilters, setCurrentFilters] = useState<{
		filters: FilterState;
		uniqueValues: any;
	} | null>(null);

	const handleFiltersChange = useCallback((filtersData: any) => {
		setCurrentFilters(filtersData);
	}, []);

	const { createShareLink } = useShareCollection(user.id);

	const handleNativeShare = useCallback(async () => {
		try {
			// Utiliser les filtres actuels ou filtres vides si pas disponibles
			const filtersToUse = currentFilters?.filters || {
				brands: [],
				sizes: [],
				conditions: [],
				statuses: [],
			};

			// Créer le lien avec les filtres actuels
			const response = await createShareLink(filtersToUse);

			// Calculer le nombre de sneakers filtrées
			const filteredCount = userSneakers.filter((sneaker) => {
				// Si aucun filtre, retourner toutes les sneakers (sauf wishlist)
				if (
					!filtersToUse.brands.length &&
					!filtersToUse.sizes.length &&
					!filtersToUse.conditions.length &&
					!filtersToUse.statuses.length
				) {
					return !sneaker.wishlist;
				}

				// Appliquer les filtres (logique basique)
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

			// Ouvrir le menu de partage natif
			await Share.share({
				message: `Check out @${user.username}'s sneaker collection on KicksFolio! 🔥\n\n${filterDescription}`,
				url: response.url,
				title: `@${user.username}'s Sneaker Collection - KicksFolio`,
			});
		} catch (error) {
			console.error('Error sharing collection:', error);
		}
	}, [currentFilters, createShareLink]);

	const handleAddSneaker = useCallback(() => {
		setModalStep('index');
		setIsVisible(true);
	}, [setModalStep, setIsVisible]);

	const isOwner = useMemo(
		() => currentUser?.id === user.id,
		[currentUser?.id, user.id]
	);

	const memoizedProfileHeader = useMemo(
		() => (
			<ProfileHeader
				user={user}
				userSneakers={userSneakers}
				showBackButton={showBackButton}
				onSharePress={isOwner ? handleNativeShare : undefined}
			/>
		),
		[
			user.id,
			user.username,
			userSneakers,
			showBackButton,
			isOwner,
			handleNativeShare,
		]
	);

	const handleRefresh = useCallback(async () => {
		await onRefresh();
	}, [onRefresh]);

	if (!userSneakers || userSneakers.length === 0) {
		return (
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
				<EmptySneakersState
					onAddPress={handleAddSneaker}
					showAddButton={isOwner}
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
				<DualViewContainer
					userSneakers={userSneakers}
					onSneakerPress={onSneakerPress}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					onFiltersChange={handleFiltersChange}
				/>
			</ScrollView>
		</>
	);
}
