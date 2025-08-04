import { Sneaker } from '@/types/Sneaker';
import { SortOption, SortOrder, FilterState } from '@/types/filter';

export interface SneakerFilterInterface {
	/**
	 * Filtre et trie une liste de sneakers selon les critères donnés
	 */
	filterAndSortSneakers(
		sneakers: Sneaker[],
		filters: FilterState,
		sortBy: SortOption,
		sortOrder: SortOrder
	): Sneaker[];

	/**
	 * Récupère toutes les valeurs uniques pour les filtres
	 */
	getUniqueValues(sneakers: Sneaker[]): {
		brands: string[];
		sizes: string[];
		conditions: string[];
	};
}
