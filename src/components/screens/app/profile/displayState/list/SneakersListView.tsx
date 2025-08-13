import { useCallback, useEffect } from 'react';

import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';

import { useSneakerFilterStore } from '@/store/useSneakerFilterStore';
import { Sneaker } from '@/types/sneaker';

import ListControls from './ListControls';
import SneakerListItem from './SneakerListItem';
import SwipeActions from './SwipeActions';

interface SneakersListViewProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	scrollEnabled?: boolean;
	showOwnerInfo?: boolean;
}

export default function SneakersListView({
	sneakers,
	onSneakerPress,
	scrollEnabled = true,
	showOwnerInfo = false,
}: SneakersListViewProps) {
	const { filteredAndSortedSneakers, setSneakers } = useSneakerFilterStore();

	useEffect(() => {
		setSneakers(sneakers);
	}, [sneakers, setSneakers]);

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

	const renderRightActions = useCallback(
		(item: Sneaker) => {
			return <SwipeActions sneaker={item} onPress={onSneakerPress} />;
		},
		[onSneakerPress]
	);

	const renderListHeader = useCallback(() => <ListControls />, []);

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
