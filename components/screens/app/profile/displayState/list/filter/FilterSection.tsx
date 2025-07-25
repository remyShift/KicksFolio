import { View, Text, TouchableOpacity } from 'react-native';
import { useListViewStore } from '@/store/useListViewStore';
import FilterGroup from './FilterGroup';
import { useTranslation } from 'react-i18next';

export default function FilterSection() {
  const { t } = useTranslation();
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
        title={t('collection.fields.brand')}
        filterKey="brand"
        options={brandOptions}
        activeValue={filters.brand}
        onFilter={updateFilter}
      />

      <FilterGroup
        title={t('collection.fields.size')}
        filterKey="size"
        options={sizeOptions}
        activeValue={filters.size}
        onFilter={updateFilter}
      />

      <FilterGroup
        title={t('collection.fields.condition')}
        filterKey="condition"
        options={conditionOptions}
        activeValue={filters.condition}
        onFilter={updateFilter}
      />

      <FilterGroup
        title={t('collection.fields.status')}
        filterKey="status"
        options={statusOptions}
        activeValue={filters.status}
        onFilter={updateFilter}
      />

      <TouchableOpacity
        className="bg-red-500 px-4 py-2 rounded-lg self-start"
        onPress={clearFilters}
      >
        <Text className="text-white text-sm">{t('collection.filters.clearAll')}</Text>
      </TouchableOpacity>
    </View>
  );
} 