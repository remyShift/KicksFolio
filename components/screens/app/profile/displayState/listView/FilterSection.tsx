import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SneakerBrand } from '@/types/Sneaker';
import { Filter } from '@/hooks/useSneakersFiltering';
import FilterButton from './FilterButton';

interface FilterSectionProps {
  showFilters: boolean;
  filters: Filter;
  uniqueValues: {
    brands: SneakerBrand[];
    sizes: number[];
    conditions: number[];
  };
  onUpdateFilter: (key: keyof Filter, value: any) => void;
  onClearFilters: () => void;
}

export default function FilterSection({ 
  showFilters, 
  filters, 
  uniqueValues, 
  onUpdateFilter, 
  onClearFilters 
}: FilterSectionProps) {
  if (!showFilters) return null;

  return (
    <View className="py-3 border-t bg-white border-gray-200 px-4">
      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-2">Brand :</Text>
        <View className="flex-row flex-wrap">
          <FilterButton
            label="All"
            isActive={!filters.brand}
            onPress={() => onUpdateFilter('brand', undefined)}
          />
          {uniqueValues.brands.map((brand) => (
            <FilterButton
              key={brand}
              label={brand}
              isActive={filters.brand === brand}
              onPress={() => onUpdateFilter('brand', brand)}
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
            onPress={() => onUpdateFilter('size', undefined)}
          />
          {uniqueValues.sizes.map((size) => (
            <FilterButton
              key={size}
              label={size.toString()}
              isActive={filters.size === size}
              onPress={() => onUpdateFilter('size', size)}
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
            onPress={() => onUpdateFilter('condition', undefined)}
          />
          {uniqueValues.conditions.map((condition) => (
            <FilterButton
              key={condition}
              label={`${condition}/10`}
              isActive={filters.condition === condition}
              onPress={() => onUpdateFilter('condition', condition)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="bg-red-500 px-4 py-2 rounded-lg self-start"
        onPress={onClearFilters}
      >
        <Text className="text-white text-sm">Clear all filters</Text>
      </TouchableOpacity>
    </View>
  );
} 