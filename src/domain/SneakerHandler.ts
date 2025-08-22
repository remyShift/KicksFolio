import { SizeUnit, Sneaker } from '@/types/sneaker';

interface SkuSearchResponse {
	results: Array<{
		title: string;
		brand: string;
		description: string;
		gender: string;
		gallery: string[];
		avg_price: number;
		sku: string;
	}>;
}

export interface SneakerHandlerInterface {
	getByUserId: (userId: string) => Promise<Sneaker[]>;
	create: (
		sneakerData: Omit<Sneaker, 'id' | 'user_id' | 'size_eu' | 'size_us'> & {
			size: number;
		},
		currentUnit?: SizeUnit
	) => Promise<Sneaker>;
	update: (
		collectionId: string,
		updates: Partial<Sneaker & { size?: number }>,
		currentUnit?: SizeUnit
	) => Promise<Sneaker>;
	delete: (collectionId: string) => Promise<void>;
	searchBySku: (sku: string) => Promise<SkuSearchResponse>;
	searchByBarcode: (barcode: string) => Promise<SkuSearchResponse>;
}

export class SneakerHandler {
	constructor(private readonly sneakerProxy: SneakerHandlerInterface) {}

	getByUserId = async (userId: string) => {
		return this.sneakerProxy
			.getByUserId(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerHandler.getByUserId: Error occurred:',
					error
				);
				throw error;
			});
	};

	create = async (
		sneakerData: Omit<Sneaker, 'id' | 'user_id' | 'size_eu' | 'size_us'> & {
			size: number;
		},
		currentUnit: SizeUnit = 'EU'
	) => {
		return this.sneakerProxy
			.create(sneakerData, currentUnit)
			.then((sneaker) => {
				return sneaker;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerHandler.create: Error occurred:',
					error
				);
				throw error;
			});
	};

	update = async (
		collectionId: string,
		updates: Partial<Sneaker & { size?: number }>,
		currentUnit: SizeUnit = 'EU'
	) => {
		return this.sneakerProxy
			.update(collectionId, updates, currentUnit)
			.then((sneaker) => {
				return sneaker;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerHandler.update: Error occurred:',
					error
				);
				throw error;
			});
	};

	delete = async (collectionId: string) => {
		return this.sneakerProxy
			.delete(collectionId)
			.then(() => {
				return;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerHandler.delete: Error occurred:',
					error
				);
				throw error;
			});
	};

	searchBySku = async (sku: string) => {
		return this.sneakerProxy
			.searchBySku(sku)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerHandler.searchBySku: Error occurred:',
					error
				);
				throw error;
			});
	};

	searchByBarcode = async (barcode: string) => {
		return this.sneakerProxy
			.searchByBarcode(barcode)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerHandler.searchByBarcode: Error occurred:',
					error
				);
				throw error;
			});
	};
}
