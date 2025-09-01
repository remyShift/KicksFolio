import { Sneaker } from '@/types/sneaker';

export function groupSneakersByBrand(
	sneakers: Sneaker[]
): Record<string, Sneaker[]> {
	return sneakers.reduce(
		(acc, sneaker) => {
			const normalizedBrand =
				sneaker.brand?.name?.toLowerCase().trim() || 'unknown';
			if (!acc[normalizedBrand]) {
				acc[normalizedBrand] = [];
			}
			acc[normalizedBrand].push(sneaker);
			return acc;
		},
		{} as Record<string, Sneaker[]>
	);
}

export function flattenSneakersByBrandOrder(sneakers: Sneaker[]): Sneaker[] {
	const sneakersByBrand = groupSneakersByBrand(sneakers);
	return Object.values(sneakersByBrand).flat();
}
