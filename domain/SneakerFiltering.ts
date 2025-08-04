import { Sneaker } from '@/types/Sneaker';
import { SortOption, SortOrder, FilterState } from '@/types/filter';
import { SneakerFilterInterface } from '@/interfaces/SneakerFilterInterface';

export class SneakerFiltering implements SneakerFilterInterface {
	filterAndSortSneakers(
		sneakers: Sneaker[],
		filters: FilterState,
		sortBy: SortOption,
		sortOrder: SortOrder
	): Sneaker[] {
		// Filtrage
		let filteredSneakers = [...sneakers];

		if (filters.brands.length > 0) {
			filteredSneakers = filteredSneakers.filter((sneaker) =>
				filters.brands.includes(sneaker.brand)
			);
		}

		if (filters.sizes.length > 0) {
			filteredSneakers = filteredSneakers.filter(
				(sneaker) =>
					sneaker.size &&
					filters.sizes.includes(sneaker.size.toString())
			);
		}

		if (filters.conditions.length > 0) {
			filteredSneakers = filteredSneakers.filter(
				(sneaker) =>
					sneaker.condition &&
					filters.conditions.includes(sneaker.condition.toString())
			);
		}

		// Tri
		filteredSneakers.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'name':
					comparison = a.model.localeCompare(b.model);
					break;
				case 'brand':
					comparison = a.brand.localeCompare(b.brand);
					break;
				case 'size':
					comparison = (a.size || 0) - (b.size || 0);
					break;
				case 'condition':
					comparison = (a.condition || 0) - (b.condition || 0);
					break;
				case 'value':
					comparison =
						(a.purchase_price || 0) - (b.purchase_price || 0);
					break;
				default:
					comparison = 0;
			}

			return sortOrder === 'desc' ? -comparison : comparison;
		});

		return filteredSneakers;
	}

	getUniqueValues(sneakers: Sneaker[]): {
		brands: string[];
		sizes: string[];
		conditions: string[];
	} {
		const brands = [
			...new Set(
				sneakers.map((sneaker) => sneaker.brand).filter(Boolean)
			),
		].sort();
		const sizes = [
			...new Set(
				sneakers
					.map((sneaker) => sneaker.size?.toString())
					.filter(Boolean)
			),
		].sort((a, b) => Number(a) - Number(b));
		const conditions = [
			...new Set(
				sneakers
					.map((sneaker) => sneaker.condition?.toString())
					.filter(Boolean)
			),
		].sort((a, b) => Number(b) - Number(a));

		return {
			brands,
			sizes,
			conditions,
		};
	}
}

export const sneakerFilterProvider = new SneakerFiltering();
