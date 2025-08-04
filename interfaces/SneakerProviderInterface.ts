import { SupabaseSneaker } from '@/domain/SneakerProvider';
import { SizeUnit } from '@/types/sneaker';

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

export interface SneakerProviderInterface {
	getSneakersByUser: (userId: string) => Promise<SupabaseSneaker[]>;
	createSneaker: (
		sneakerData: Omit<
			SupabaseSneaker,
			| 'id'
			| 'created_at'
			| 'updated_at'
			| 'user_id'
			| 'size_eu'
			| 'size_us'
		> & { size: number },
		currentUnit?: SizeUnit
	) => Promise<SupabaseSneaker>;
	updateSneaker: (
		id: string,
		updates: Partial<SupabaseSneaker & { size?: number }>,
		currentUnit?: SizeUnit
	) => Promise<SupabaseSneaker>;
	deleteSneaker: (id: string) => Promise<void>;
	searchBySku: (sku: string) => Promise<SkuSearchResponse>;
	searchByBarcode: (barcode: string) => Promise<SkuSearchResponse>;
}

export class SneakerProviderInterface {
	static getSneakersByUser = async (
		userId: string,
		getSneakersFunction: SneakerProviderInterface['getSneakersByUser']
	) => {
		return getSneakersFunction(userId)
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

	static createSneaker = async (
		sneakerData: Omit<
			SupabaseSneaker,
			| 'id'
			| 'created_at'
			| 'updated_at'
			| 'user_id'
			| 'size_eu'
			| 'size_us'
		> & { size: number },
		currentUnit: SizeUnit = 'EU',
		createSneakerFunction: SneakerProviderInterface['createSneaker']
	) => {
		return createSneakerFunction(sneakerData, currentUnit)
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

	static updateSneaker = async (
		id: string,
		updates: Partial<SupabaseSneaker & { size?: number }>,
		currentUnit: SizeUnit = 'EU',
		updateSneakerFunction: SneakerProviderInterface['updateSneaker']
	) => {
		return updateSneakerFunction(id, updates, currentUnit)
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

	static deleteSneaker = async (
		id: string,
		deleteSneakerFunction: SneakerProviderInterface['deleteSneaker']
	) => {
		return deleteSneakerFunction(id)
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

	static searchBySku = async (
		sku: string,
		searchBySkuFunction: SneakerProviderInterface['searchBySku']
	) => {
		return searchBySkuFunction(sku)
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

	static searchByBarcode = async (
		barcode: string,
		searchByBarcodeFunction: SneakerProviderInterface['searchByBarcode']
	) => {
		return searchByBarcodeFunction(barcode)
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

export const SneakerInterface = SneakerProviderInterface;
