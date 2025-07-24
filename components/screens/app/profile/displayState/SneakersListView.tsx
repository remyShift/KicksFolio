import React, { useCallback, useEffect } from 'react';
import { FlatList, View, RefreshControl } from 'react-native';
import { Sneaker } from '@/types/Sneaker';
import { useListViewStore } from '@/store/useListViewStore';
import SneakerListItem from './listView/SneakerListItem';
import ListControls from './listView/ListControls';

interface SneakersListViewProps {
  sneakers: Sneaker[];
  onSneakerPress: (sneaker: Sneaker) => void;
  header?: React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
  scrollEnabled?: boolean;
  showOwnerInfo?: boolean;
}

export default function SneakersListView({ 
  sneakers, 
  onSneakerPress, 
  header,
  refreshing = false,
  onRefresh,
  scrollEnabled = true,
  showOwnerInfo = false
}: SneakersListViewProps) {
  const { filteredAndSortedSneakers, initializeData } = useListViewStore();

  useEffect(() => {
    initializeData(sneakers);
  }, [sneakers, initializeData]);

  const renderSneakerItem = useCallback(({ item }: { item: Sneaker }) => (
    <SneakerListItem sneaker={item} onPress={onSneakerPress} showOwnerInfo={showOwnerInfo} />
  ), [onSneakerPress, showOwnerInfo]);

  const renderListHeader = useCallback(() => (
    <>
      {header}
      <ListControls />
    </>
  ), [header]);

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
      refreshControl={
        (onRefresh && scrollEnabled) ? (
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
            progressViewOffset={60}
          />
        ) : undefined
      }
    />
  );
} 