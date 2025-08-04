import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SortOption } from '@/types/filter';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'name', label: 'collection.fields.name' },
  { key: 'brand', label: 'collection.fields.brand' },
  { key: 'size', label: 'collection.fields.size' },
  { key: 'condition', label: 'collection.fields.condition' },
  { key: 'value', label: 'collection.fields.value' }
];

interface SortButtonsProps {
  	listState: ReturnType<typeof import('@/hooks/useSneakerFiltering').useSneakerFiltering>;
}

export default function SortButtons({ listState }: SortButtonsProps) {
  const { sortBy, sortOrder, toggleSort } = listState;
  const { t } = useTranslation();
  return (
    <View className="flex-row flex-wrap gap-2 mb-2 px-4">
      <Text className="text-sm font-medium text-gray-700 mr-2">{t('collection.filters.sortBy')}</Text>
      {SORT_OPTIONS.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          className={`px-2 py-1 rounded flex-row items-center gap-1 ${sortBy === key ? 'bg-primary' : 'bg-gray-200'}`}
          onPress={() => toggleSort(key)}
        >
          <Text className={`text-xs ${sortBy === key ? 'text-white' : 'text-gray-700'}`}>
            {t(label)}
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