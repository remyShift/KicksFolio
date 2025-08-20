import { sneakerSizeConverter } from '@/d/SneakerSizeConverter';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { GenderType, SizeUnit, Sneaker } from '@/types/sneaker';

export const useSizeConversion = () => {
	const { currentUnit } = useSizeUnitStore();

	const getSizeForCurrentUnit = (sneaker: Sneaker): number => {
		const size = currentUnit === 'EU' ? sneaker.size_eu : sneaker.size_us;
		return size || 0;
	};

	const formatSizeForDisplay = (sneaker: Sneaker): string => {
		const size = getSizeForCurrentUnit(sneaker);
		return sneakerSizeConverter.formatSize(size, currentUnit);
	};

	const generateBothSizes = (
		inputSize: number,
		gender: GenderType = 'men'
	): { size_eu: number; size_us: number } => {
		return sneakerSizeConverter.generateBothSizes(inputSize, gender);
	};

	const convertToCurrentUnit = (
		size: number,
		originalUnit: SizeUnit,
		gender: GenderType = 'men'
	): number => {
		return sneakerSizeConverter.convertSize(
			size,
			originalUnit,
			currentUnit,
			gender
		);
	};

	const getAvailableSizesForCurrentUnit = (
		gender: GenderType = 'men'
	): number[] => {
		return sneakerSizeConverter.getAvailableSizes(currentUnit, gender);
	};

	const isValidSizeInCurrentUnit = (
		size: number,
		gender: GenderType = 'men'
	): boolean => {
		return sneakerSizeConverter.isValidSize(size, currentUnit, gender);
	};

	const formatCurrentUnitSize = (size: number): string => {
		return sneakerSizeConverter.formatSize(size, currentUnit);
	};

	const getOriginalUnit = (size: number): SizeUnit => {
		return sneakerSizeConverter.detectSizeUnit(size);
	};

	const convertAndFormat = (
		originalSize: number,
		originalUnit: SizeUnit,
		displayUnit: SizeUnit,
		gender: GenderType = 'men'
	): string => {
		return sneakerSizeConverter.convertAndFormat(
			originalSize,
			originalUnit,
			displayUnit,
			gender
		);
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
		convertAndFormat,
	};
};
