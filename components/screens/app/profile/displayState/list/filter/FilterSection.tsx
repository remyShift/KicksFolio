import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSneakerFilterStore } from '@/store/useSneakerFilterStore';
import FilterGroup from './FilterGroup';
import { FilterState } from '@/types/filter';

export default function FilterSection() {
  const { t } = useTranslation();
  const { 
    showFilters, 
    filters, 
    uniqueValues, 
    updateFilter, 
    clearFilters 
  } = useSneakerFilterStore();
  
  if (!showFilters) return null;

  const handleFilterUpdate = (
    filterKey: 'brand' | 'size' | 'condition' | 'status', 
    value: any
  ) => {
    const stateKeyMap: Record<typeof filterKey, keyof FilterState> = {
      brand: 'brands',
      size: 'sizes', 
      condition: 'conditions',
      status: 'statuses'
    };

    const stateKey = stateKeyMap[filterKey];
    
    if (value === undefined) {
      updateFilter(stateKey, []);
    } else {
      updateFilter(stateKey, [value.toString()]);
    }
  };

  const getCurrentValue = (filterKey: 'brand' | 'size' | 'condition' | 'status') => {
    const stateKeyMap = {
      brand: filters.brands,
      size: filters.sizes,
      condition: filters.conditions,
      status: filters.statuses || []
    };

    const currentArray = stateKeyMap[filterKey];
    return currentArray.length > 0 ? currentArray[0] : undefined;
  };

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

  const statusOptions = (uniqueValues.statuses).map(status => ({
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
        activeValue={getCurrentValue('brand')}
        onFilter={handleFilterUpdate}
      />

      <FilterGroup
        title={t('collection.fields.size')}
        filterKey="size"
        options={sizeOptions}
        activeValue={getCurrentValue('size')}
        onFilter={handleFilterUpdate}
      />

      <FilterGroup
        title={t('collection.fields.condition')}
        filterKey="condition"
        options={conditionOptions}
        activeValue={getCurrentValue('condition')}
        onFilter={handleFilterUpdate}
      />

      <FilterGroup
        title={t('collection.fields.status')}
        filterKey="status"
        options={statusOptions}
        activeValue={getCurrentValue('status')}
        onFilter={handleFilterUpdate}
      />
    </View>
  );
} 