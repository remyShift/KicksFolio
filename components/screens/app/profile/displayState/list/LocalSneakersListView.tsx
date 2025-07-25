import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { Sneaker } from '@/types/Sneaker';
import { useLocalListState } from '@/hooks/useLocalListState';
import SneakerListItem from './SneakerListItem';
import LocalListControls from './LocalListControls';

interface LocalSneakersListViewProps {
  sneakers: Sneaker[];
  onSneakerPress: (sneaker: Sneaker) => void;
  scrollEnabled?: boolean;
  showOwnerInfo?: boolean;
}

export default function LocalSneakersListView({ 
  sneakers, 
  onSneakerPress, 
  scrollEnabled = true,
  showOwnerInfo = false
}: LocalSneakersListViewProps) {
  const listState = useLocalListState(sneakers);

  const renderSneakerItem = useCallback(({ item }: { item: Sneaker }) => (
    <SneakerListItem sneaker={item} onPress={onSneakerPress} showOwnerInfo={showOwnerInfo} />
  ), [onSneakerPress, showOwnerInfo]);

  const renderListHeader = useCallback(() => (
    <LocalListControls listState={listState} />
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