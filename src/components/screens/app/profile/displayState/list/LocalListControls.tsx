import { View } from 'react-native';

import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import { Sneaker } from '@/types/sneaker';

import FilterSection from './filter/FilterSection';
import SortButtons from './filter/SortButtons';

interface LocalListControlsProps {
	sneakers: Sneaker[];
}

export default function LocalListControls({
	sneakers,
}: LocalListControlsProps) {
	const {
		uniqueValues,
		sortBy,
		sortOrder,
		showFilters,
		filters,
		toggleSort,
		toggleFilters,
		updateFilter,
		clearFilters,
	} = useLocalSneakerData(sneakers);

	return (
		<View className="px-4 py-2 bg-white border-b border-gray-100">
			<SortButtons
				sortBy={sortBy}
				sortOrder={sortOrder}
				onSort={toggleSort}
				onToggleFilters={toggleFilters}
			/>
			{showFilters && (
				<FilterSection
					uniqueValues={uniqueValues}
					filters={filters}
					onUpdateFilter={updateFilter}
					onClearFilters={clearFilters}
				/>
			)}
		</View>
	);
}
