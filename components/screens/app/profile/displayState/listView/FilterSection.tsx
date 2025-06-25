import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useListViewStore } from '@/store/useListViewStore';
import FilterGroup from './FilterGroup';

export default function FilterSection() {
  const { 
    showFilters, 
    filters, 
    uniqueValues, 
    updateFilter, 
    clearFilters 
  } = useListViewStore();
  
  if (!showFilters) return null;
  const brandOptions = uniqueValues.brands.map(brand => ({
    label: brand,
    value: brand
  }));

  const sizeOptions = uniqueValues.sizes.map(size => ({
    label: size.toString(),
    value: size
  }));

  const conditionOptions = uniqueValues.conditions.map(condition => ({
    label: `${condition}/10`,
    value: condition
  }));

  const statusOptions = uniqueValues.statuses.map(status => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: status
  }));

  return (
    <View className="py-3 border-t bg-white border-gray-200 px-4">
      <FilterGroup
        title="Brand"
        filterKey="brand"
        options={brandOptions}
        activeValue={filters.brand}
        onFilter={updateFilter}
      />

      <FilterGroup
        title="Size"
        filterKey="size"
        options={sizeOptions}
        activeValue={filters.size}
        onFilter={updateFilter}
      />

      <FilterGroup
        title="Condition"
        filterKey="condition"
        options={conditionOptions}
        activeValue={filters.condition}
        onFilter={updateFilter}
      />

      <FilterGroup
        title="Status"
        filterKey="status"
        options={statusOptions}
        activeValue={filters.status}
        onFilter={updateFilter}
      />

      <TouchableOpacity
        className="bg-red-500 px-4 py-2 rounded-lg self-start"
        onPress={clearFilters}
      >
        <Text className="text-white text-sm">Clear all filters</Text>
      </TouchableOpacity>
    </View>
  );
} 