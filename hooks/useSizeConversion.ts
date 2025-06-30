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
		console.log(
			'formatSizeForDisplay',
			size,
			originalUnit,
			currentUnit,
			gender
		);
		console.log(
			'convertAndFormat',
			SizeConversionService.convertAndFormat(
				size,
				originalUnit,
				currentUnit,
				gender
			)
		);
		return SizeConversionService.convertAndFormat(
			size,
			originalUnit,
			currentUnit,
			gender
		);
	};

	const getOriginalUnit = (
		size: number,
		gender: GenderType = 'men'
	): SizeUnit => {
		return size >= 7 && size <= 15 ? 'US' : 'EU';
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
		getOriginalUnit,
		getAvailableSizesForCurrentUnit,
		isValidSizeInCurrentUnit,
		formatCurrentUnitSize,
		SizeConversionService,
	};
};
