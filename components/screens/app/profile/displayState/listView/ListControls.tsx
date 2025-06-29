import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useListViewStore } from '@/store/useListViewStore';
import SortButtons from './SortButtons';
import FilterSection from './FilterSection';
import { useTranslation } from 'react-i18next';

export default function ListControls() {
  const { t } = useTranslation();
  const { 
    filteredAndSortedSneakers, 
    toggleFilters 
  } = useListViewStore();

  return (
    <View className="py-2 bg-background border-b border-gray-200 mb-2">
      <View className="flex-row justify-between items-center mb-3 px-4">
        <Text className="text-lg font-semibold">
          {filteredAndSortedSneakers.length} sneaker{filteredAndSortedSneakers.length > 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={toggleFilters}
        >
          <Ionicons name="filter" size={16} color="gray" />
          <Text className="ml-1 text-gray-600">{t('common.sneaker.filters')}</Text>
        </TouchableOpacity>
      </View>

      <SortButtons />

      <FilterSection />
    </View>
  );
} 