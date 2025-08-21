import { memo, useCallback, useMemo } from 'react';

import { RefreshControl, ScrollView, View } from 'react-native';

import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';
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
			/>
		),
		[user.id, user.username, userSneakers, showBackButton]
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
	);
}
