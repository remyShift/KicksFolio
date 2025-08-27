import { View } from 'react-native';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import { SharedCollectionData } from '@/types/sharing';

import { AnonymousUserMessage } from './AnonymousUserMessage';

export function SharedCollectionForAnonymous({
	collectionData,
	loading,
	onRefresh,
	filteredSneakers,
}: {
	collectionData: SharedCollectionData;
	loading: boolean;
	onRefresh: () => Promise<void>;
	filteredSneakers: any[];
}) {
	return (
		<View className="flex-1 bg-background pt-12">
			<ProfileDisplayContainer
				user={collectionData.user_data}
				userSneakers={filteredSneakers}
				refreshing={loading}
				onRefresh={onRefresh}
				showBackButton={false}
				isAnonymousUser={true}
				showSettingsButton={false}
				showAnonymousMessage={true}
			/>
		</View>
	);
}
