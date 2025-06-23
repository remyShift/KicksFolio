import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SneakerBrand } from '@/types/Sneaker';
import { SortOption, Filter } from '@/hooks/useSneakersFiltering';
import SortButtons from './SortButtons';
import FilterSection from './FilterSection';

interface ListControlsProps {
  filteredCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  onToggleSort: (option: SortOption) => void;
  filters: Filter;
  uniqueValues: {
    brands: SneakerBrand[];
    sizes: number[];
    conditions: number[];
  };
  onUpdateFilter: (key: keyof Filter, value: any) => void;
  onClearFilters: () => void;
}

export default function ListControls({
  filteredCount,
  showFilters,
  onToggleFilters,
  sortBy,
  sortOrder,
  onToggleSort,
  filters,
  uniqueValues,
  onUpdateFilter,
  onClearFilters
}: ListControlsProps) {
  return (
    <View className="py-2 bg-background border-b border-gray-200 mb-2">
      <View className="flex-row justify-between items-center mb-3 px-4">
        <Text className="text-lg font-semibold">
          {filteredCount} sneaker{filteredCount > 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={onToggleFilters}
        >
          <Ionicons name="filter" size={16} color="gray" />
          <Text className="ml-1 text-gray-600">Filters</Text>
        </TouchableOpacity>
      </View>

      <SortButtons 
        sortBy={sortBy}
        sortOrder={sortOrder}
        onToggleSort={onToggleSort}
      />

      <FilterSection
        showFilters={showFilters}
        filters={filters}
        uniqueValues={uniqueValues}
        onUpdateFilter={onUpdateFilter}
        onClearFilters={onClearFilters}
      />
    </View>
  );
} 