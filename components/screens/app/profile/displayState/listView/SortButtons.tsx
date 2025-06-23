import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SortOption } from '@/hooks/useSneakersFiltering';

interface SortButtonsProps {
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  onToggleSort: (option: SortOption) => void;
}

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'brand', label: 'Brand' },
  { key: 'size', label: 'Size' },
  { key: 'condition', label: 'Condition' },
  { key: 'price', label: 'Price Paid' }
];

export default function SortButtons({ sortBy, sortOrder, onToggleSort }: SortButtonsProps) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-2 px-4">
      <Text className="text-sm font-medium text-gray-700 mr-2">Sort by :</Text>
      {SORT_OPTIONS.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          className={`px-2 py-1 rounded flex-row items-center gap-1 ${sortBy === key ? 'bg-primary' : 'bg-gray-200'}`}
          onPress={() => onToggleSort(key)}
        >
          <Text className={`text-xs ${sortBy === key ? 'text-white' : 'text-gray-700'}`}>
            {label}
          </Text>
          {sortBy === key && (
            <Ionicons 
              name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
              size={12} 
              color="white"
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
} 