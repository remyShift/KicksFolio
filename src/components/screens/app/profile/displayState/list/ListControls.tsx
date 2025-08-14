import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
	FilterState,
	SortOption,
	SortOrder,
	UniqueValues,
} from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

import FilterSection from './filter/FilterSection';
import SortButtons from './filter/SortButtons';

interface ListControlsProps {
	sneakers: Sneaker[];
	uniqueValues: UniqueValues;
	sortBy: SortOption;
	sortOrder: SortOrder;
	showFilters: boolean;
	filters: FilterState;
	onToggleSort: (option: SortOption) => void;
	onToggleFilters: () => void;
	onUpdateFilter: (filterType: keyof FilterState, values: string[]) => void;
	onClearFilters: () => void;
}

export default function ListControls({
	sneakers,
	uniqueValues,
	sortBy,
	sortOrder,
	showFilters,
	filters,
	onToggleSort,
	onToggleFilters,
	onUpdateFilter,
	onClearFilters,
}: ListControlsProps) {
	const { t } = useTranslation();

	return (
		<View className="py-2 bg-background border-b border-gray-200 mb-2">
			<View className="flex-row justify-between items-center mb-3 px-4">
				<Text className="text-lg font-semibold">
					{sneakers.length} sneaker
					{sneakers.length > 1 ? 's' : ''}
				</Text>
				<TouchableOpacity
					className="flex-row items-center"
					onPress={onToggleFilters}
				>
					<Ionicons name="filter" size={16} color="gray" />
					<Text className="ml-1 text-gray-600">
						{t('collection.filters.title')}
					</Text>
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
