import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { Filter, SortOption } from '@/types/filter';
import { SizeUnit } from '@/types/sneaker';

export interface UniqueValues {
	brands: SneakerBrand[];
	sizes: number[];
	conditions: number[];
	statuses: SneakerStatus[];
}

export interface SneakerFilterInterface {
	filterSneakers(
		sneakers: Sneaker[],
		filters: Filter,
		currentUnit: SizeUnit
	): Sneaker[];
	sortSneakers(
		sneakers: Sneaker[],
		sortBy: SortOption,
		sortOrder: 'asc' | 'desc',
		currentUnit: SizeUnit
	): Sneaker[];
	getUniqueValues(sneakers: Sneaker[], currentUnit: SizeUnit): UniqueValues;
	getSizeForUnit(sneaker: Sneaker, unit: SizeUnit): number;
}

export class SneakerFilterInterface {
	static filterSneakers = async (
		sneakers: Sneaker[],
		filters: Filter,
		currentUnit: SizeUnit,
		filterFunction: SneakerFilterInterface['filterSneakers']
	) => {
		try {
			return filterFunction(sneakers, filters, currentUnit);
		} catch (error) {
			console.error('Error filtering sneakers:', error);
			return sneakers;
		}
	};

	static sortSneakers = async (
		sneakers: Sneaker[],
		sortBy: SortOption,
		sortOrder: 'asc' | 'desc',
		currentUnit: SizeUnit,
		sortFunction: SneakerFilterInterface['sortSneakers']
	) => {
		try {
			return sortFunction(sneakers, sortBy, sortOrder, currentUnit);
		} catch (error) {
			console.error('Error sorting sneakers:', error);
			return sneakers;
		}
	};

	static getUniqueValues = async (
		sneakers: Sneaker[],
		currentUnit: SizeUnit,
		getValuesFunction: SneakerFilterInterface['getUniqueValues']
	) => {
		try {
			return getValuesFunction(sneakers, currentUnit);
		} catch (error) {
			console.error('Error getting unique values:', error);
			return { brands: [], sizes: [], conditions: [], statuses: [] };
		}
	};

	static getSizeForUnit = async (
		sneaker: Sneaker,
		unit: SizeUnit,
		getSizeFunction: SneakerFilterInterface['getSizeForUnit']
	) => {
		try {
			return getSizeFunction(sneaker, unit);
		} catch (error) {
			console.error('Error getting size for unit:', error);
			return 0;
		}
	};
}
