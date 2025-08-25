import { memo, useCallback, useMemo } from 'react';

import { RefreshControl, ScrollView, View } from 'react-native';

import ShareCollectionModal from '@/components/ui/modals/ShareCollectionModal';
import { useSession } from '@/contexts/authContext';
import { useShareCollection } from '@/hooks/useShareCollection';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

import { useSneakerFiltering } from '../profile/hooks/useSneakerFiltering';
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

	const { uniqueValues } = useSneakerFiltering({
		sneakers: userSneakers,
	});

	const { modalState, toggleModal, createShareLink, copyToClipboard } =
		useShareCollection(user.id);

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
				onSharePress={isOwner ? toggleModal : undefined}
			/>
		),
		[
			user.id,
			user.username,
			userSneakers,
			showBackButton,
			isOwner,
			toggleModal,
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
				/>
			</ScrollView>

			{isOwner && (
				<ShareCollectionModal
					isVisible={modalState.isVisible}
					isLoading={modalState.isLoading}
					shareUrl={modalState.shareUrl}
					userSneakers={userSneakers}
					uniqueValues={uniqueValues}
					onClose={toggleModal}
					onCreateShare={createShareLink}
					onCopyToClipboard={copyToClipboard}
				/>
			)}
		</>
	);
}
