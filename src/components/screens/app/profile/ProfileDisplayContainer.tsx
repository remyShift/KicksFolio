import { RefreshControl, ScrollView } from 'react-native';

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
		showBackButton = false,
	} = props;

	const { setModalStep, setIsVisible } = useModalStore();

	const handleAddSneaker = () => {
		setModalStep('index');
		setIsVisible(true);
	};

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
				<ProfileHeader
					user={user}
					userSneakers={[]}
					showBackButton={showBackButton}
				/>
				<EmptySneakersState
					onAddPress={handleAddSneaker}
					showAddButton={true}
				/>
			</ScrollView>
		);
	}

	return (
		<DualViewContainer
			user={user}
			userSneakers={userSneakers}
			refreshing={refreshing}
			onRefresh={onRefresh}
			showBackButton={showBackButton}
		/>
	);
}
