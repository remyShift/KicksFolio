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
	getSneakersByUser: (userId: string) => Promise<Sneaker[]>;
	createSneaker: (
		sneakerData: Omit<Sneaker, 'id' | 'user_id' | 'size_eu' | 'size_us'> & {
			size: number;
		},
		currentUnit?: SizeUnit
	) => Promise<Sneaker>;
	updateSneaker: (
		id: string,
		updates: Partial<Sneaker & { size?: number }>,
		currentUnit?: SizeUnit
	) => Promise<Sneaker>;
	deleteSneaker: (id: string) => Promise<void>;
	searchBySku: (sku: string) => Promise<SkuSearchResponse>;
	searchByBarcode: (barcode: string) => Promise<SkuSearchResponse>;
}

export class SneakerHandler {
	constructor(private readonly sneakerHandler: SneakerHandlerInterface) {}

	getSneakersByUser = async (userId: string) => {
		return this.sneakerHandler
			.getSneakersByUser(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerInterface.getSneakersByUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	createSneaker = async (
		sneakerData: Omit<Sneaker, 'id' | 'user_id' | 'size_eu' | 'size_us'> & {
			size: number;
		},
		currentUnit: SizeUnit = 'EU'
	) => {
		return this.sneakerHandler
			.createSneaker(sneakerData, currentUnit)
			.then((sneaker) => {
				return sneaker;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerInterface.createSneaker: Error occurred:',
					error
				);
				throw error;
			});
	};

	updateSneaker = async (
		id: string,
		updates: Partial<Sneaker & { size?: number }>,
		currentUnit: SizeUnit = 'EU'
	) => {
		return this.sneakerHandler
			.updateSneaker(id, updates, currentUnit)
			.then((sneaker) => {
				return sneaker;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerInterface.updateSneaker: Error occurred:',
					error
				);
				throw error;
			});
	};

	deleteSneaker = async (id: string) => {
		return this.sneakerHandler
			.deleteSneaker(id)
			.then(() => {
				return;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerInterface.deleteSneaker: Error occurred:',
					error
				);
				throw error;
			});
	};

	searchBySku = async (sku: string) => {
		return this.sneakerHandler
			.searchBySku(sku)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerInterface.searchBySku: Error occurred:',
					error
				);
				throw error;
			});
	};

	searchByBarcode = async (barcode: string) => {
		return this.sneakerHandler
			.searchByBarcode(barcode)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ SneakerInterface.searchByBarcode: Error occurred:',
					error
				);
				throw error;
			});
	};
}
