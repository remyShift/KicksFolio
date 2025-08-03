import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import {
	SneakerSizeConverter,
	SizeUnit,
	GenderType,
} from '@/domain/SneakerSizeConverter';
import { Sneaker } from '@/types/Sneaker';

export const useSizeConversion = () => {
	const { currentUnit } = useSizeUnitStore();

	const getSizeForCurrentUnit = (sneaker: Sneaker): number => {
		return currentUnit === 'EU' ? sneaker.size_eu : sneaker.size_us;
	};

	const formatSizeForDisplay = (sneaker: Sneaker): string => {
		const size = getSizeForCurrentUnit(sneaker);
		return SneakerSizeConverter.formatSize(size, currentUnit);
	};

	const generateBothSizes = (
		inputSize: number,
		gender: GenderType = 'men'
	): { size_eu: number; size_us: number } => {
		return SneakerSizeConverter.generateBothSizes(inputSize, gender);
	};

	const convertToCurrentUnit = (
		size: number,
		originalUnit: SizeUnit,
		gender: GenderType = 'men'
	): number => {
		return SneakerSizeConverter.convertSize(
			size,
			originalUnit,
			currentUnit,
			gender
		);
	};

	const getAvailableSizesForCurrentUnit = (
		gender: GenderType = 'men'
	): number[] => {
		return SneakerSizeConverter.getAvailableSizes(currentUnit, gender);
	};

	const isValidSizeInCurrentUnit = (
		size: number,
		gender: GenderType = 'men'
	): boolean => {
		return SneakerSizeConverter.isValidSize(size, currentUnit, gender);
	};

	const formatCurrentUnitSize = (size: number): string => {
		return SneakerSizeConverter.formatSize(size, currentUnit);
	};

	const getOriginalUnit = (size: number): SizeUnit => {
		return SneakerSizeConverter.detectSizeUnit(size);
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
		SneakerSizeConverter,
	};
};
