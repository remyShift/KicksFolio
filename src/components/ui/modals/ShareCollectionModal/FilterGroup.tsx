import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import { FilterState, UniqueValues } from '@/types/filter';

import FilterButton from './FilterButton';

interface FilterGroupProps {
	uniqueValues: UniqueValues;
	filters: FilterState;
	updateFilter: (filterType: keyof FilterState, values: string[]) => void;
}

export default function FilterGroup({
	uniqueValues,
	filters,
	updateFilter,
}: FilterGroupProps) {
	const { t } = useTranslation();

	const handleFilterToggle = (
		filterType: keyof FilterState,
		value: string
	) => {
		const currentValues = filters[filterType] as string[];
		const isSelected = currentValues.includes(value);

		if (isSelected) {
			updateFilter(
				filterType,
				currentValues.filter((v) => v !== value)
			);
		} else {
			updateFilter(filterType, [...currentValues, value]);
		}
	};

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			{uniqueValues.brands.length > 0 && (
				<View className="mb-6">
					<Text className="text-base font-semibold mb-3">
						{t('collection.filters.brands')}
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{uniqueValues.brands.map((brand) => (
							<FilterButton
								key={brand}
								label={brand}
								isActive={filters.brands.includes(brand)}
								onPress={() =>
									handleFilterToggle('brands', brand)
								}
							/>
						))}
					</View>
				</View>
			)}

			{uniqueValues.sizes.length > 0 && (
				<View className="mb-6">
					<Text className="text-base font-semibold mb-3">
						{t('collection.filters.sizes')}
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{uniqueValues.sizes.map((size) => (
							<FilterButton
								key={size}
								label={size}
								isActive={filters.sizes.includes(size)}
								onPress={() =>
									handleFilterToggle('sizes', size)
								}
							/>
						))}
					</View>
				</View>
			)}

			{uniqueValues.conditions.length > 0 && (
				<View className="mb-6">
					<Text className="text-base font-semibold mb-3">
						{t('collection.filters.conditions')}
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{uniqueValues.conditions.map((condition) => (
							<FilterButton
								key={condition}
								label={`${condition}/10`}
								isActive={filters.conditions.includes(
									condition
								)}
								onPress={() =>
									handleFilterToggle('conditions', condition)
								}
							/>
						))}
					</View>
				</View>
			)}

			{uniqueValues.statuses.length > 0 && (
				<View className="mb-6">
					<Text className="text-base font-semibold mb-3">
						{t('collection.filters.statuses')}
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{uniqueValues.statuses.map((status) => (
							<FilterButton
								key={status}
								label={t(`collection.status.${status}`)}
								isActive={filters.statuses.includes(status)}
								onPress={() =>
									handleFilterToggle(
										'statuses',
										status.toString()
									)
								}
							/>
						))}
					</View>
				</View>
			)}
		</ScrollView>
	);
}
