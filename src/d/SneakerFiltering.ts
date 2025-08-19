import { SneakerFilterProviderInterface } from '@/domain/SneakerFilterInterface';
import {
	FilterState,
	SortOption,
	SortOrder,
	UniqueValues,
} from '@/types/filter';
import { Sneaker } from '@/types/sneaker';

class SneakerFiltering implements SneakerFilterProviderInterface {
	filterSneakers(
		sneakers: Sneaker[],
		filters: FilterState,
		currentUnit: 'US' | 'EU'
	): Sneaker[] {
		let filteredSneakers = [...sneakers];

		if (filters.brands.length > 0) {
			filteredSneakers = filteredSneakers.filter((sneaker) =>
				filters.brands.includes(sneaker.brand)
			);
		}

		if (filters.sizes.length > 0) {
			filteredSneakers = filteredSneakers.filter((sneaker) => {
				const size =
					currentUnit === 'US' ? sneaker.size_us : sneaker.size_eu;
				return size && filters.sizes.includes(size.toString());
			});
		}

		if (filters.conditions.length > 0) {
			filteredSneakers = filteredSneakers.filter(
				(sneaker) =>
					sneaker.condition &&
					filters.conditions.includes(sneaker.condition.toString())
			);
		}

		if (filters.statuses && filters.statuses.length > 0) {
			filteredSneakers = filteredSneakers.filter((sneaker) =>
				filters.statuses!.includes(sneaker.status)
			);
		}

		return filteredSneakers;
	}

	sortSneakers(
		sneakers: Sneaker[],
		sortBy: SortOption,
		sortOrder: SortOrder,
		currentUnit: 'US' | 'EU'
	): Sneaker[] {
		const sortedSneakers = [...sneakers];

		sortedSneakers.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'name':
					comparison = a.model.localeCompare(b.model);
					break;
				case 'brand':
					comparison = a.brand.localeCompare(b.brand);
					break;
				case 'size':
					const sizeA = currentUnit === 'US' ? a.size_us : a.size_eu;
					const sizeB = currentUnit === 'US' ? b.size_us : b.size_eu;
					comparison = (sizeA || 0) - (sizeB || 0);
					break;
				case 'condition':
					comparison = (a.condition || 0) - (b.condition || 0);
					break;
				case 'value':
					comparison =
						(a.estimated_value || 0) - (b.estimated_value || 0);
					break;
				default:
					comparison = 0;
			}

			return sortOrder === 'desc' ? -comparison : comparison;
		});

		return sortedSneakers;
	}

	getUniqueValues(
		sneakers: Sneaker[],
		currentUnit: 'US' | 'EU'
	): UniqueValues {
		const brands = [
			...new Set(
				sneakers.map((sneaker) => sneaker.brand).filter(Boolean)
			),
		].sort();

		const sizes = [
			...new Set(
				sneakers
					.map((sneaker) => {
						const size =
							currentUnit === 'US'
								? sneaker.size_us
								: sneaker.size_eu;
						return size?.toString();
					})
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

		const statuses = [
			...new Set(
				sneakers.map((sneaker) => sneaker.status).filter(Boolean)
			),
		].sort();

		return {
			brands,
			sizes,
			conditions,
			statuses,
		};
	}
}

export const sneakerFilteringProvider = new SneakerFiltering();
