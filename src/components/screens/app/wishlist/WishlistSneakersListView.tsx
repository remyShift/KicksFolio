import { useCallback } from 'react';

import { View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { FlashList } from '@shopify/flash-list';

import { useSneakerFiltering } from '@/hooks/useSneakerFiltering';
import { Sneaker } from '@/types/sneaker';

import ListControls from '../profile/displayState/list/ListControls';
import SneakerListItem from '../profile/displayState/list/SneakerListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

interface WishlistSneakersListViewProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
}

export default function WishlistSneakersListView({
	sneakers,
	onSneakerPress,
	showOwnerInfo = false,
}: WishlistSneakersListViewProps) {
	const {
		filteredAndSortedSneakers,
		uniqueValues,
		sortBy,
		sortOrder,
		showFilters,
		filters,
		toggleSort,
		toggleFilters,
		updateFilter,
		clearFilters,
	} = useSneakerFiltering({ sneakers });

	const renderSneakerItem = useCallback(
		({ item }: { item: Sneaker }) => {
			return (
				<Swipeable
					renderRightActions={() => (
						<WishlistSwipeActions sneaker={item} />
					)}
					overshootRight={false}
				>
					<SneakerListItem
						sneaker={item}
						showOwnerInfo={showOwnerInfo}
					/>
				</Swipeable>
			);
		},
		[showOwnerInfo]
	);

	const renderListHeader = useCallback(() => {
		return (
			<ListControls
				uniqueValues={uniqueValues}
				sortBy={sortBy}
				sortOrder={sortOrder}
				showFilters={showFilters}
				filters={filters}
				onToggleSort={toggleSort}
				onToggleFilters={toggleFilters}
				onUpdateFilter={updateFilter}
				onClearFilters={clearFilters}
				filteredAndSortedSneakers={filteredAndSortedSneakers}
			/>
		);
	}, [
		uniqueValues,
		sortBy,
		sortOrder,
		showFilters,
		filters,
		toggleSort,
		toggleFilters,
		updateFilter,
		clearFilters,
	]);

	return (
		<FlashList
			data={filteredAndSortedSneakers}
			renderItem={renderSneakerItem}
			keyExtractor={(item) => item.id}
			ListHeaderComponent={renderListHeader}
			contentContainerStyle={{ paddingTop: 0 }}
			showsVerticalScrollIndicator={false}
			scrollEnabled={false}
			nestedScrollEnabled={false}
			keyboardShouldPersistTaps="handled"
		/>
	);
}
