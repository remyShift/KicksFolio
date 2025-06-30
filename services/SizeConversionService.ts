export type SizeUnit = 'US' | 'EU';
export type GenderType = 'men' | 'women';

interface SizeMapping {
	usMen: number;
	usWomen: number;
	eu: number;
}

const SIZE_MAPPINGS: SizeMapping[] = [
	{ usMen: 3.5, usWomen: 5, eu: 35.5 },
	{ usMen: 4, usWomen: 5.5, eu: 36 },
	{ usMen: 4.5, usWomen: 6, eu: 36.5 },
	{ usMen: 5, usWomen: 6.5, eu: 37.5 },
	{ usMen: 5.5, usWomen: 7, eu: 38 },
	{ usMen: 6, usWomen: 7.5, eu: 38.5 },
	{ usMen: 6.5, usWomen: 8, eu: 39 },
	{ usMen: 7, usWomen: 8.5, eu: 40 },
	{ usMen: 7.5, usWomen: 9, eu: 40.5 },
	{ usMen: 8, usWomen: 9.5, eu: 41 },
	{ usMen: 8.5, usWomen: 10, eu: 42 },
	{ usMen: 9, usWomen: 10.5, eu: 42.5 },
	{ usMen: 9.5, usWomen: 11, eu: 43 },
	{ usMen: 10, usWomen: 11.5, eu: 44 },
	{ usMen: 10.5, usWomen: 12, eu: 44.5 },
	{ usMen: 11, usWomen: 12.5, eu: 45 },
	{ usMen: 11.5, usWomen: 13, eu: 45.5 },
	{ usMen: 12, usWomen: 13.5, eu: 46 },
	{ usMen: 12.5, usWomen: 14, eu: 47 },
	{ usMen: 13, usWomen: 14.5, eu: 47.5 },
	{ usMen: 13.5, usWomen: 15, eu: 48 },
	{ usMen: 14, usWomen: 15.5, eu: 48.5 },
	{ usMen: 14.5, usWomen: 16, eu: 49 },
	{ usMen: 15, usWomen: 16.5, eu: 49.5 },
	{ usMen: 15.5, usWomen: 17, eu: 50 },
];

export class SizeConversionService {
	static convertSize(
		size: number,
		fromUnit: SizeUnit,
		toUnit: SizeUnit,
		gender: GenderType = 'men'
	): number {
		if (fromUnit === toUnit) return size;

		const mapping = SIZE_MAPPINGS.find((mapping) => {
			switch (fromUnit) {
				case 'US':
					return gender === 'men'
						? mapping.usMen === size
						: mapping.usWomen === size;
				case 'EU':
					return mapping.eu === size;
				default:
					return false;
			}
		});

		if (!mapping) return size;

		switch (toUnit) {
			case 'US':
				return gender === 'men' ? mapping.usMen : mapping.usWomen;
			case 'EU':
				return mapping.eu;
			default:
				return size;
		}
	}

	static formatSize(size: number, unit: SizeUnit): string {
		return `${String(size)} ${unit}`;
	}

	static convertAndFormat(
		originalSize: number,
		originalUnit: SizeUnit,
		displayUnit: SizeUnit,
		gender: GenderType = 'men'
	): string {
		const convertedSize = this.convertSize(
			originalSize,
			originalUnit,
			displayUnit,
			gender
		);

		if (convertedSize === originalSize) {
			return this.formatSize(originalSize, originalUnit);
		}

		return this.formatSize(convertedSize, displayUnit);
	}

	static getAvailableSizes(
		unit: SizeUnit,
		gender: GenderType = 'men'
	): number[] {
		return SIZE_MAPPINGS.map((mapping) => {
			switch (unit) {
				case 'US':
					return gender === 'men' ? mapping.usMen : mapping.usWomen;
				case 'EU':
					return mapping.eu;
				default:
					return 0;
			}
		}).filter((size) => size > 0);
	}

	static isValidSize(
		size: number,
		unit: SizeUnit,
		gender: GenderType = 'men'
	): boolean {
		const availableSizes = this.getAvailableSizes(unit, gender);
		return availableSizes.includes(size);
	}

	static detectSizeUnit(size: number): SizeUnit {
		return size >= 3.5 && size <= 17 ? 'US' : 'EU';
	}

	static generateBothSizes(
		inputSize: number,
		gender: GenderType = 'men'
	): { size_eu: number; size_us: number } {
		const detectedUnit = this.detectSizeUnit(inputSize);

		if (detectedUnit === 'EU') {
			return {
				size_eu: inputSize,
				size_us: this.convertSize(inputSize, 'EU', 'US', gender),
			};
		} else {
			return {
				size_eu: this.convertSize(inputSize, 'US', 'EU', gender),
				size_us: inputSize,
			};
		}
	}
}
