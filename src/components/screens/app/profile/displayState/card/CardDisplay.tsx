import { RefreshControl, ScrollView } from 'react-native';

import { Sneaker } from '@/types/sneaker';
import { SearchUser, User } from '@/types/user';

import ProfileHeader from '../../ProfileHeader';
import LocalSneakersCardByBrand from './LocalSneakersCardByBrand';

interface CardDisplayProps {
	handleSneakerPress: (sneaker: Sneaker) => void;
	refreshing: boolean;
	onRefresh: () => Promise<void>;
	user: User | SearchUser;
	userSneakers: Sneaker[];
	showBackButton?: boolean;
}

export default function CardDisplay(props: CardDisplayProps) {
	if (!props || typeof props !== 'object') {
		console.error('CardDisplay: Props sont null ou invalides:', props);
		return null;
	}

	const {
		handleSneakerPress,
		refreshing,
		onRefresh,
		user,
		userSneakers,
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
			<ProfileHeader user={user} showBackButton={showBackButton} />
			<LocalSneakersCardByBrand
				sneakers={userSneakers}
				onSneakerPress={handleSneakerPress}
			/>
		</ScrollView>
	);
}
