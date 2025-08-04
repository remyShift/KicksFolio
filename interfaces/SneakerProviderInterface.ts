import { Sneaker } from '@/types/sneaker';
import { SupabaseSneaker } from '@/domain/SneakerProvider';
import { SizeUnit } from '@/types/sneaker';

export interface SneakerProviderInterface {
	getSneakersByUser: (userId: string) => Promise<Sneaker[]>;
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
	) => Promise<Sneaker>;
	updateSneaker: (
		id: string,
		updates: Partial<SupabaseSneaker & { size?: number }>,
		currentUnit?: SizeUnit
	) => Promise<Sneaker | null>;
	deleteSneaker: (id: string) => Promise<void>;
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
					'❌ SneakerProviderInterface.getSneakersByUser: Error occurred:',
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
					'❌ SneakerProviderInterface.createSneaker: Error occurred:',
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
					'❌ SneakerProviderInterface.updateSneaker: Error occurred:',
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
					'❌ SneakerProviderInterface.deleteSneaker: Error occurred:',
					error
				);
				throw error;
			});
	};
}
