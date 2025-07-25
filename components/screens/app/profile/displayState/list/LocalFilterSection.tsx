import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import FilterGroup from './FilterGroup';

interface LocalFilterSectionProps {
  listState: ReturnType<typeof import('@/hooks/useLocalListState').useLocalListState>;
}

export default function LocalFilterSection({ listState }: LocalFilterSectionProps) {
  const { t } = useTranslation();
  const { 
    showFilters, 
    filters, 
    uniqueValues, 
    updateFilter, 
    clearFilters 
  } = listState;
  
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
    <View className="px-4 py-2 bg-gray-50 border border-gray-200 rounded mx-4 mb-2">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-semibold text-gray-800">
          {t('collection.filters.title')}
        </Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text className="text-primary text-sm font-medium">
            {t('collection.filters.clear')}
          </Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
} 