import { Text, View } from "react-native";
import FilterButton from "./FilterButton";
import { useTranslation } from "react-i18next";

interface FilterGroupProps {
    title: string;
    filterKey: 'brand' | 'size' | 'condition' | 'status';
    options: Array<{ label: string; value: any }>;
    activeValue: any;
    onFilter: (key: 'brand' | 'size' | 'condition' | 'status', value: any) => void;
}

export default function FilterGroup({ title, filterKey, options, activeValue, onFilter }: FilterGroupProps) {
    const { t } = useTranslation();
    return (
        <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-2">{title} :</Text>
            <View className="flex-row flex-wrap">
            <FilterButton
                label={t('collection.filters.all')}
                isActive={!activeValue}
                onPress={() => onFilter(filterKey, undefined)}
            />
            {options.map((option) => (
                <FilterButton
                    key={option.value}
                    label={option.label}
                    isActive={activeValue === option.value}
                    onPress={() => onFilter(filterKey, option.value)}
                />
            ))}
            </View>
        </View>
        );
}