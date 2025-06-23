import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useListViewStore } from '@/store/useListViewStore';
import FilterButton from './FilterButton';

export default function FilterSection() {
  const { 
    showFilters, 
    filters, 
    uniqueValues, 
    updateFilter, 
    clearFilters 
  } = useListViewStore();
  if (!showFilters) return null;

  return (
    <View className="py-3 border-t bg-white border-gray-200 px-4">
      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-2">Brand :</Text>
        <View className="flex-row flex-wrap">
          <FilterButton
            label="All"
            isActive={!filters.brand}
            onPress={() => updateFilter('brand', undefined)}
          />
          {uniqueValues.brands.map((brand) => (
            <FilterButton
              key={brand}
              label={brand}
              isActive={filters.brand === brand}
              onPress={() => updateFilter('brand', brand)}
            />
          ))}
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-2">Size :</Text>
        <View className="flex-row flex-wrap">
          <FilterButton
            label="All"
            isActive={!filters.size}
            onPress={() => updateFilter('size', undefined)}
          />
          {uniqueValues.sizes.map((size) => (
            <FilterButton
              key={size}
              label={size.toString()}
              isActive={filters.size === size}
              onPress={() => updateFilter('size', size)}
            />
          ))}
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-2">Condition :</Text>
        <View className="flex-row flex-wrap">
          <FilterButton
            label="All"
            isActive={!filters.condition}
            onPress={() => updateFilter('condition', undefined)}
          />
          {uniqueValues.conditions.map((condition) => (
            <FilterButton
              key={condition}
              label={`${condition}/10`}
              isActive={filters.condition === condition}
              onPress={() => updateFilter('condition', condition)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="bg-red-500 px-4 py-2 rounded-lg self-start"
        onPress={clearFilters}
      >
        <Text className="text-white text-sm">Clear all filters</Text>
      </TouchableOpacity>
    </View>
  );
} 