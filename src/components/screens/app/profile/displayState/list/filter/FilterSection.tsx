import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { FilterState } from '@/types/filter';
import { SneakerStatus } from '@/types/sneaker';

import FilterGroup from './FilterGroup';

interface FilterSectionProps {
	showFilters: boolean;
	filters: FilterState;
	uniqueValues: {
		brands: string[];
		sizes: string[];
		conditions: string[];
		statuses: number[];
	};
	onUpdateFilter: (filterType: keyof FilterState, values: string[]) => void;
	onClearFilters: () => void;
}

export default function FilterSection({
	showFilters,
	filters,
	uniqueValues,
	onUpdateFilter,
	onClearFilters,
}: FilterSectionProps) {
	const { t } = useTranslation();

	const STATUS_LABELS: Record<number, string> = {
		[SneakerStatus.ROCKING]: 'ROCKING',
		[SneakerStatus.SELLING]: 'SELLING',
		[SneakerStatus.STOCKING]: 'STOCKING',
	};

	if (!showFilters) return null;

	const handleFilterUpdate = (
		filterKey: 'brand' | 'size' | 'condition' | 'status',
		value: any
	) => {
		const stateKeyMap: Record<typeof filterKey, keyof FilterState> = {
			brand: 'brands',
			size: 'sizes',
			condition: 'conditions',
			status: 'statuses',
		};

		const stateKey = stateKeyMap[filterKey];

		if (value === undefined) {
			onUpdateFilter(stateKey, []);
		} else {
			onUpdateFilter(stateKey, [value.toString()]);
		}
	};

	const getCurrentValue = (
		filterKey: 'brand' | 'size' | 'condition' | 'status'
	) => {
		const stateKeyMap = {
			brand: filters.brands,
			size: filters.sizes,
			condition: filters.conditions,
			status: filters.statuses || [],
		};

		const currentArray = stateKeyMap[filterKey];
		return currentArray.length > 0 ? currentArray[0] : undefined;
	};

	const brandOptions = uniqueValues.brands.map((brand) => ({
		label: brand,
		value: brand,
	}));

	const sizeOptions = uniqueValues.sizes.map((size) => ({
		label: size.toString(),
		value: size,
	}));

	const conditionOptions = uniqueValues.conditions.map((condition) => ({
		label: `${condition}/10`,
		value: condition,
	}));

	const statusOptions = uniqueValues.statuses.map((status) => ({
		label: STATUS_LABELS[status] ?? status.toString(),
		value: status.toString(),
	}));

	return (
		<View className="px-4 py-2 bg-gray-50 border border-gray-200 rounded mx-4 mb-2">
			<View className="flex-row justify-between items-center mb-3">
				<Text className="text-base font-semibold text-gray-900">
					{t('collection.filters.title')}
				</Text>
				<TouchableOpacity onPress={onClearFilters}>
					<Text className="text-primary text-sm font-medium">
						{t('collection.filters.clearAll')}
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
