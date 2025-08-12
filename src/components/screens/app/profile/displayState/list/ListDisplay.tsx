import { RefreshControl, ScrollView } from 'react-native';

import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

import ProfileHeader from '../../ProfileHeader';
import SneakersListView from './SneakersListView';

interface ListDisplayProps {
	userSneakers: Sneaker[];
	handleSneakerPress: (sneaker: Sneaker) => void;
	refreshing: boolean;
	onRefresh: () => Promise<void>;
	user: User | SearchUser;
	showBackButton?: boolean;
}

export default function ListDisplay(props: ListDisplayProps) {
	if (!props || typeof props !== 'object') {
		console.error('ListDisplay: Props sont null ou invalides:', props);
		return null;
	}

	const {
		userSneakers,
		handleSneakerPress,
		refreshing,
		onRefresh,
		user,
		showBackButton,
	} = props;
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
				userSneakers={userSneakers}
				showBackButton={showBackButton}
			/>
			<SneakersListView
				sneakers={userSneakers}
				onSneakerPress={handleSneakerPress}
				scrollEnabled={false}
			/>
		</ScrollView>
	);
}
