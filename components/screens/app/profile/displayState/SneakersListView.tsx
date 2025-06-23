import React, { useState } from 'react';
import { FlatList, View, RefreshControl } from 'react-native';
import { Sneaker } from '@/types/Sneaker';
import { useSneakersFiltering } from '@/hooks/useSneakersFiltering';
import SneakerListItem from './listView/SneakerListItem';
import ListControls from './listView/ListControls';

interface SneakersListViewProps {
  sneakers: Sneaker[];
  onSneakerPress: (sneaker: Sneaker) => void;
  header?: React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => Promise<void>;
}

export default function SneakersListView({ 
  sneakers, 
  onSneakerPress, 
  header,
  refreshing = false,
  onRefresh 
}: SneakersListViewProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    filteredAndSortedSneakers,
    uniqueValues,
    sortBy,
    sortOrder,
    filters,
    toggleSort,
    updateFilter,
    clearFilters
  } = useSneakersFiltering(sneakers);

  const renderSneakerItem = ({ item }: { item: Sneaker }) => (
    <SneakerListItem sneaker={item} onPress={onSneakerPress} />
  );

  const renderListHeader = () => (
    <View className="gap-8">
      {header}
      <ListControls
        filteredCount={filteredAndSortedSneakers.length}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onToggleSort={toggleSort}
        filters={filters}
        uniqueValues={uniqueValues}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />
    </View>
  );

  return (
    <FlatList
      data={filteredAndSortedSneakers}
      renderItem={renderSneakerItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderListHeader}
      contentContainerStyle={{ paddingTop: 0 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
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