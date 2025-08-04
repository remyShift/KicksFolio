import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';
import { SizeUnit } from '@/types/sneaker';
import {
	SneakerFilterInterface,
	UniqueValues,
} from '@/interfaces/SneakerFilterInterface';
import { Filter, SortOption } from '@/types/filter';

export class SneakerFilterProvider implements SneakerFilterInterface {
	filterSneakers(
		sneakers: Sneaker[],
		filters: Filter,
		currentUnit: SizeUnit
	): Sneaker[] {
		let result = [...sneakers];

		if (filters.brand) {
			result = result.filter((s) => s.brand === filters.brand);
		}

		if (filters.size !== undefined) {
			result = result.filter(
				(s) => this.getSizeForUnit(s, currentUnit) === filters.size
			);
		}

		if (filters.condition !== undefined) {
			result = result.filter((s) => s.condition === filters.condition);
		}

		if (filters.status) {
			result = result.filter((s) => s.status === filters.status);
		}

		return result;
	}

	sortSneakers(
		sneakers: Sneaker[],
		sortBy: SortOption,
		sortOrder: 'asc' | 'desc',
		currentUnit: SizeUnit
	): Sneaker[] {
		return [...sneakers].sort((a, b) => {
			let aVal: any;
			let bVal: any;

			switch (sortBy) {
				case 'name':
					aVal = a.model.toLowerCase();
					bVal = b.model.toLowerCase();
					break;
				case 'brand':
					aVal = a.brand.toLowerCase();
					bVal = b.brand.toLowerCase();
					break;
				case 'size':
					aVal = this.getSizeForUnit(a, currentUnit);
					bVal = this.getSizeForUnit(b, currentUnit);
					break;
				case 'condition':
					aVal = a.condition;
					bVal = b.condition;
					break;
				case 'value':
					aVal = a.estimated_value || 0;
					bVal = b.estimated_value || 0;
					break;
				default:
					aVal = a.model.toLowerCase();
					bVal = b.model.toLowerCase();
			}

			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}

	getUniqueValues(sneakers: Sneaker[], currentUnit: SizeUnit): UniqueValues {
		if (!sneakers.length) {
			return { brands: [], sizes: [], conditions: [], statuses: [] };
		}

		return {
			brands: [...new Set(sneakers.map((s) => s.brand))],
			sizes: [
				...new Set(
					sneakers.map((s) => this.getSizeForUnit(s, currentUnit))
				),
			].sort((a, b) => a - b),
			conditions: [...new Set(sneakers.map((s) => s.condition))].sort(
				(a, b) => b - a
			),
			statuses: [...new Set(sneakers.map((s) => s.status))],
		};
	}

	getSizeForUnit(sneaker: Sneaker, unit: SizeUnit): number {
		return unit === 'EU' ? sneaker.size_eu : sneaker.size_us;
	}
}

export const sneakerFilterProvider = new SneakerFilterProvider();
