import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { Sneaker } from '@/types/Sneaker';
import { useLocalListState } from '@/hooks/TODO/useLocalListState';
import SneakerListItem from './SneakerListItem';
import ListControls from './ListControls';

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
  showOwnerInfo = false
}: SneakersListViewProps) {
  const listState = useLocalListState(sneakers);

  const renderSneakerItem = useCallback(({ item }: { item: Sneaker }) => (
    <SneakerListItem sneaker={item} onPress={onSneakerPress} showOwnerInfo={showOwnerInfo} />
  ), [onSneakerPress, showOwnerInfo]);

  const renderListHeader = useCallback(() => (
    <ListControls listState={listState} />
  ), [listState]);

  return (
    <FlatList
      data={listState.filteredAndSortedSneakers}
      renderItem={renderSneakerItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderListHeader}
      contentContainerStyle={{ paddingTop: 0 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled={!scrollEnabled}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
    />
  );
} 