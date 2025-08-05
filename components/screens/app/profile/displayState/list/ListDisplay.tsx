import { RefreshControl, ScrollView, View } from 'react-native';

import { SearchUser } from '@/domain/UserSearchProvider';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';

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

export default function ListDisplay({
	userSneakers,
	handleSneakerPress,
	refreshing,
	onRefresh,
	user,
	showBackButton,
}: ListDisplayProps) {
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
