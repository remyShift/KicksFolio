import { RefreshControl, ScrollView } from 'react-native';

import { SearchUser } from '@/domain/UserSearchProvider';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';

import ProfileHeader from '../../ProfileHeader';
import SneakersCardByBrand from './SneakersCardByBrand';

interface CardDisplayProps {
	sneakersByBrand: Record<string, Sneaker[]>;
	handleSneakerPress: (sneaker: Sneaker) => void;
	refreshing: boolean;
	onRefresh: () => Promise<void>;
	user: User | SearchUser;
	userSneakers: Sneaker[];
	showBackButton?: boolean;
}

export default function CardDisplay({
	sneakersByBrand,
	handleSneakerPress,
	refreshing,
	onRefresh,
	user,
	userSneakers,
	showBackButton,
}: CardDisplayProps) {
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
			<SneakersCardByBrand
				sneakersByBrand={sneakersByBrand}
				onSneakerPress={handleSneakerPress}
			/>
		</ScrollView>
	);
}
