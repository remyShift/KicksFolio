import { RefreshControl, ScrollView, View } from 'react-native';

import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
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
	const { viewDisplayState } = useViewDisplayStateStore();

	const handleAddSneaker = () => {
		setModalStep('index');
		setIsVisible(true);
	};

	const isOwner = currentUser?.id === user.id;
	const isListView = viewDisplayState === ViewDisplayState.List;
	const isLargeCollection = userSneakers && userSneakers.length >= 50;

	const shouldUseScrollView = !(isListView && isLargeCollection);

	if (!userSneakers || userSneakers.length === 0) {
		return (
			<ScrollView
				className="flex-1 mt-16"
				testID="scroll-view"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#FF6B6B"
						progressViewOffset={60}
						testID="refresh-control"
					/>
				}
			>
				<ProfileHeader user={user} showBackButton={showBackButton} />
				<EmptySneakersState
					onAddPress={handleAddSneaker}
					showAddButton={isOwner}
				/>
			</ScrollView>
		);
	}

	if (!shouldUseScrollView) {
		return (
			<View className="flex-1 mt-16">
				<ProfileHeader user={user} showBackButton={showBackButton} />
				<DualViewContainer
					user={user}
					userSneakers={userSneakers}
					onSneakerPress={onSneakerPress}
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			</View>
		);
	}

	return (
		<ScrollView
			className="flex-1 mt-16"
			testID="scroll-view"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					tintColor="#FF6B6B"
					progressViewOffset={60}
					testID="refresh-control"
				/>
			}
		>
			<ProfileHeader user={user} showBackButton={showBackButton} />
			<DualViewContainer
				user={user}
				userSneakers={userSneakers}
				onSneakerPress={onSneakerPress}
				refreshing={refreshing}
				onRefresh={onRefresh}
			/>
		</ScrollView>
	);
}
