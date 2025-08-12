import {
	FilterState,
	SortOption,
	SortOrder,
	UniqueValues,
} from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

export interface SneakerFilterProviderInterface {
	filterSneakers(
		sneakers: Sneaker[],
		filters: FilterState,
		currentUnit: 'US' | 'EU'
	): Sneaker[];

	sortSneakers(
		sneakers: Sneaker[],
		sortBy: SortOption,
		sortOrder: SortOrder,
		currentUnit: 'US' | 'EU'
	): Sneaker[];

	getUniqueValues(
		sneakers: Sneaker[],
		currentUnit: 'US' | 'EU'
	): UniqueValues;
}

export class SneakerFilterInterface {
	static filterSneakers = (
		sneakers: Sneaker[],
		filters: FilterState,
		currentUnit: 'US' | 'EU',
		filterSneakersFunction: SneakerFilterProviderInterface['filterSneakers']
	) => {
		try {
			return filterSneakersFunction(sneakers, filters, currentUnit);
		} catch (error) {
			console.error(
				'❌ SneakerFilterInterface.filterSneakers: Error occurred:',
				error
			);
			throw error;
		}
	};

	static sortSneakers = (
		sneakers: Sneaker[],
		sortBy: SortOption,
		sortOrder: SortOrder,
		currentUnit: 'US' | 'EU',
		sortSneakersFunction: SneakerFilterProviderInterface['sortSneakers']
	) => {
		try {
			return sortSneakersFunction(
				sneakers,
				sortBy,
				sortOrder,
				currentUnit
			);
		} catch (error) {
			console.error(
				'❌ SneakerFilterInterface.sortSneakers: Error occurred:',
				error
			);
			throw error;
		}
	};

	static getUniqueValues = (
		sneakers: Sneaker[],
		currentUnit: 'US' | 'EU',
		getUniqueValuesFunction: SneakerFilterProviderInterface['getUniqueValues']
	) => {
		try {
			return getUniqueValuesFunction(sneakers, currentUnit);
		} catch (error) {
			console.error(
				'❌ SneakerFilterInterface.getUniqueValues: Error occurred:',
				error
			);
			throw error;
		}
	};
}
