import { FilterState } from '@/types/filter';
import {
	CreateSharedCollectionRequest,
	CreateSharedCollectionResponse,
	SharedCollectionData,
} from '@/types/sharing';

export interface ShareHandlerInterface {
	createShareLink: (
		userId: string,
		filters: FilterState
	) => Promise<CreateSharedCollectionResponse>;

	getSharedCollection: (shareToken: string) => Promise<SharedCollectionData>;

	deleteShareLink: (shareToken: string) => Promise<void>;

	getUserShareLinks: (userId: string) => Promise<string[]>;
}

export class ShareHandler {
	constructor(private readonly shareProxy: ShareHandlerInterface) {}

	createShareLink = async (userId: string, filters: FilterState) => {
		return this.shareProxy
			.createShareLink(userId, filters)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ ShareHandler.createShareLink: Error occurred:',
					error
				);
				throw error;
			});
	};

	getSharedCollection = async (shareToken: string) => {
		return this.shareProxy
			.getSharedCollection(shareToken)
			.then((data) => {
				return data;
			})
			.catch((error) => {
				console.error(
					'❌ ShareHandler.getSharedCollection: Error occurred:',
					error
				);
				throw error;
			});
	};

	deleteShareLink = async (shareToken: string) => {
		return this.shareProxy
			.deleteShareLink(shareToken)
			.then(() => {
				return;
			})
			.catch((error) => {
				console.error(
					'❌ ShareHandler.deleteShareLink: Error occurred:',
					error
				);
				throw error;
			});
	};

	getUserShareLinks = async (userId: string) => {
		return this.shareProxy
			.getUserShareLinks(userId)
			.then((links) => {
				return links;
			})
			.catch((error) => {
				console.error(
					'❌ ShareHandler.getUserShareLinks: Error occurred:',
					error
				);
				throw error;
			});
	};
}
