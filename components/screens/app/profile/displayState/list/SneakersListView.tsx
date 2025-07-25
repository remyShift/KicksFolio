import { useCallback, useEffect } from 'react';
import { FlatList } from 'react-native';
import { Sneaker } from '@/types/Sneaker';
import { useListViewStore } from '@/store/useListViewStore';
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
  const { filteredAndSortedSneakers, initializeData, clearFilters } = useListViewStore();

  useEffect(() => {
    // Réinitialiser complètement le store avec de nouvelles données
    // Cela évite le mélange de données entre différents utilisateurs
    clearFilters();
    initializeData(sneakers);
  }, [sneakers, initializeData, clearFilters]);

  const renderSneakerItem = useCallback(({ item }: { item: Sneaker }) => (
    <SneakerListItem sneaker={item} onPress={onSneakerPress} showOwnerInfo={showOwnerInfo} />
  ), [onSneakerPress, showOwnerInfo]);

  const renderListHeader = useCallback(() => (
    <ListControls />
  ), []);

  return (
    <FlatList
      data={filteredAndSortedSneakers}
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