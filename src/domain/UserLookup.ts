import { SearchUser, SearchUsersResponse } from '@/types/user';

export interface UserLookupInterface {
	search: (
		searchTerm: string,
		currentUserId: string,
		page?: number
	) => Promise<SearchUsersResponse>;

	getProfile: (
		userId: string,
		currentUserId: string
	) => Promise<SearchUser | null>;

	getSneakers: (userId: string) => Promise<any[]>;
}

export class UserLookup {
	constructor(private readonly userLookupProxy: UserLookupInterface) {}

	search = async (
		searchTerm: string,
		currentUserId: string,
		page: number = 0
	) => {
		return this.userLookupProxy
			.search(searchTerm, currentUserId, page)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error('❌ UserLookup.search: Error occurred:', error);
				throw error;
			});
	};

	getProfile = async (userId: string, currentUserId: string) => {
		return this.userLookupProxy
			.getProfile(userId, currentUserId)
			.then((user) => {
				return user;
			})
			.catch((error) => {
				console.error(
					'❌ UserLookup.getProfile: Error occurred:',
					error
				);
				throw error;
			});
	};

	getSneakers = async (userId: string) => {
		return this.userLookupProxy
			.getSneakers(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ UserLookup.getSneakers: Error occurred:',
					error
				);
				throw error;
			});
	};
}
