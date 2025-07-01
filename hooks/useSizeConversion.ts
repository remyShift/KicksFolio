import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import {
	SizeConversionService,
	SizeUnit,
	GenderType,
} from '@/services/SizeConversionService';
import { Sneaker } from '@/types/Sneaker';

export const useSizeConversion = () => {
	const { currentUnit } = useSizeUnitStore();

	const getSizeForCurrentUnit = (sneaker: Sneaker): number => {
		return currentUnit === 'EU' ? sneaker.size_eu : sneaker.size_us;
	};

	const formatSizeForDisplay = (sneaker: Sneaker): string => {
		const size = getSizeForCurrentUnit(sneaker);
		return SizeConversionService.formatSize(size, currentUnit);
	};

	const generateBothSizes = (
		inputSize: number,
		gender: GenderType = 'men'
	): { size_eu: number; size_us: number } => {
		return SizeConversionService.generateBothSizes(inputSize, gender);
	};

	const convertToCurrentUnit = (
		size: number,
		originalUnit: SizeUnit,
		gender: GenderType = 'men'
	): number => {
		return SizeConversionService.convertSize(
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

	const getOriginalUnit = (size: number): SizeUnit => {
		return SizeConversionService.detectSizeUnit(size);
	};

	return {
		currentUnit,
		getSizeForCurrentUnit,
		formatSizeForDisplay,
		generateBothSizes,
		convertToCurrentUnit,
		getAvailableSizesForCurrentUnit,
		isValidSizeInCurrentUnit,
		formatCurrentUnitSize,
		getOriginalUnit,
		SizeConversionService,
	};
};
