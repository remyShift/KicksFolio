import { useCallback } from 'react';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import { Sneaker } from '@/types/sneaker';

import SneakerListItem from '../profile/displayState/list/SneakerListItem';
import WishlistListControls from './WishlistListControls';
import WishlistSwipeActions from './WishlistSwipeActions';

interface WishlistSneakersListViewProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	scrollEnabled?: boolean;
	showOwnerInfo?: boolean;
}

export default function WishlistSneakersListView({
	sneakers,
	onSneakerPress,
	scrollEnabled = true,
	showOwnerInfo = false,
}: WishlistSneakersListViewProps) {
	const { filteredAndSortedSneakers } = useLocalSneakerData(sneakers);

	const renderSneakerItem = useCallback(
		({ item }: { item: Sneaker }) => (
			<SneakerListItem
				sneaker={item}
				onPress={onSneakerPress}
				showOwnerInfo={showOwnerInfo}
			/>
		),
		[onSneakerPress, showOwnerInfo]
	);

	const renderRightActions = useCallback((item: Sneaker) => {
		return <WishlistSwipeActions sneaker={item} />;
	}, []);

	const renderListHeader = useCallback(
		() => <WishlistListControls sneakers={sneakers} />,
		[sneakers]
	);

	return (
		<SwipeableFlatList
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			renderRightActions={renderRightActions}
			keyExtractor={(item) => item.id}
			ListHeaderComponent={renderListHeader}
			contentContainerStyle={{ paddingTop: 0 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={scrollEnabled}
			nestedScrollEnabled={!scrollEnabled}
			keyboardShouldPersistTaps="handled"
			removeClippedSubviews={false}
			enableOpenMultipleRows={false}
		/>
	);
}
