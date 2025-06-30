import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import {
	SizeConversionService,
	SizeUnit,
	GenderType,
} from '@/services/SizeConversionService';

export const useSizeConversion = () => {
	const { currentUnit } = useSizeUnitStore();

	const convertToCurrentUnit = (
		size: number,
		originalUnit: SizeUnit,
		gender: GenderType = 'men'
	): number | null => {
		return SizeConversionService.convertSize(
			size,
			originalUnit,
			currentUnit,
			gender
		);
	};

	const formatSizeForDisplay = (
		size: number,
		originalUnit: SizeUnit,
		gender: GenderType = 'men'
	): string => {
		return SizeConversionService.convertAndFormat(
			size,
			originalUnit,
			currentUnit,
			gender
		);
	};

	const getAvailableSizesForCurrentUnit = (
		gender: GenderType = 'men'
	): number[] => {
		return SizeConversionService.getAvailableSizes(currentUnit, gender);
	};

	const isValidSizeInCurrentUnit = (
		size: number,
		gender: GenderType = 'men'
	): boolean => {
		return SizeConversionService.isValidSize(size, currentUnit, gender);
	};

	const formatCurrentUnitSize = (size: number): string => {
		return SizeConversionService.formatSize(size, currentUnit);
	};

	return {
		currentUnit,
		convertToCurrentUnit,
		formatSizeForDisplay,
		getAvailableSizesForCurrentUnit,
		isValidSizeInCurrentUnit,
		formatCurrentUnitSize,
		SizeConversionService,
	};
};
