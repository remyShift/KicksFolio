import { SizeUnit } from '@/types/Sneaker';
import { GenderType } from '@/domain/SneakerSizeConverter';

export interface SneakerSizeConverterInterface {
	convertSize: (
		size: number,
		fromUnit: SizeUnit,
		toUnit: SizeUnit,
		gender?: GenderType
	) => number;
	formatSize: (size: number, unit: SizeUnit) => string;
	convertAndFormat: (
		originalSize: number,
		originalUnit: SizeUnit,
		displayUnit: SizeUnit,
		gender?: GenderType
	) => string;
	getAvailableSizes: (unit: SizeUnit, gender?: GenderType) => number[];
	isValidSize: (size: number, unit: SizeUnit, gender?: GenderType) => boolean;
	detectSizeUnit: (size: number) => SizeUnit;
	generateBothSizes: (
		inputSize: number,
		gender?: GenderType,
		inputUnit?: SizeUnit
	) => { size_eu: number; size_us: number };
}

export class SneakerSizeConverterInterface {
	static convertSize = async (
		size: number,
		fromUnit: SizeUnit,
		toUnit: SizeUnit,
		gender: GenderType = 'men',
		convertFunction: SneakerSizeConverterInterface['convertSize']
	) => {
		try {
			const convertedSize = convertFunction(
				size,
				fromUnit,
				toUnit,
				gender
			);
			return convertedSize;
		} catch (error) {
			console.error(
				'❌ SneakerSizeConverterInterface.convertSize: Error occurred:',
				error
			);
			throw error;
		}
	};

	static formatSize = async (
		size: number,
		unit: SizeUnit,
		formatFunction: SneakerSizeConverterInterface['formatSize']
	) => {
		try {
			const formattedSize = formatFunction(size, unit);
			return formattedSize;
		} catch (error) {
			console.error(
				'❌ SneakerSizeConverterInterface.formatSize: Error occurred:',
				error
			);
			throw error;
		}
	};

	static convertAndFormat = async (
		originalSize: number,
		originalUnit: SizeUnit,
		displayUnit: SizeUnit,
		gender: GenderType = 'men',
		convertAndFormatFunction: SneakerSizeConverterInterface['convertAndFormat']
	) => {
		try {
			const result = convertAndFormatFunction(
				originalSize,
				originalUnit,
				displayUnit,
				gender
			);
			return result;
		} catch (error) {
			console.error(
				'❌ SneakerSizeConverterInterface.convertAndFormat: Error occurred:',
				error
			);
			throw error;
		}
	};

	static getAvailableSizes = async (
		unit: SizeUnit,
		gender: GenderType = 'men',
		getAvailableSizesFunction: SneakerSizeConverterInterface['getAvailableSizes']
	) => {
		try {
			const sizes = getAvailableSizesFunction(unit, gender);
			return sizes;
		} catch (error) {
			console.error(
				'❌ SneakerSizeConverterInterface.getAvailableSizes: Error occurred:',
				error
			);
			throw error;
		}
	};

	static isValidSize = async (
		size: number,
		unit: SizeUnit,
		gender: GenderType = 'men',
		isValidSizeFunction: SneakerSizeConverterInterface['isValidSize']
	) => {
		try {
			const isValid = isValidSizeFunction(size, unit, gender);
			return isValid;
		} catch (error) {
			console.error(
				'❌ SneakerSizeConverterInterface.isValidSize: Error occurred:',
				error
			);
			throw error;
		}
	};

	static detectSizeUnit = async (
		size: number,
		detectSizeUnitFunction: SneakerSizeConverterInterface['detectSizeUnit']
	) => {
		try {
			const unit = detectSizeUnitFunction(size);
			return unit;
		} catch (error) {
			console.error(
				'❌ SneakerSizeConverterInterface.detectSizeUnit: Error occurred:',
				error
			);
			throw error;
		}
	};

	static generateBothSizes = async (
		inputSize: number,
		gender: GenderType = 'men',
		inputUnit: SizeUnit | undefined = undefined,
		generateBothSizesFunction: SneakerSizeConverterInterface['generateBothSizes']
	) => {
		try {
			const sizes = generateBothSizesFunction(
				inputSize,
				gender,
				inputUnit
			);
			return sizes;
		} catch (error) {
			console.error(
				'❌ SneakerSizeConverterInterface.generateBothSizes: Error occurred:',
				error
			);
			throw error;
		}
	};
}
