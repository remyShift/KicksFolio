import { SearchUser, SearchUsersResponse } from '@/types/user';

export interface UserSearchInterface {
	searchUsers: (
		searchTerm: string,
		currentUserId: string,
		page?: number
	) => Promise<SearchUsersResponse>;

	getUserProfile: (
		userId: string,
		currentUserId: string
	) => Promise<SearchUser | null>;

	getUserSneakers: (userId: string) => Promise<any[]>;
}

export class UserSearch {
	constructor(private readonly userSearch: UserSearchInterface) {}

	searchUsers = async (
		searchTerm: string,
		currentUserId: string,
		page: number = 0
	) => {
		return this.userSearch
			.searchUsers(searchTerm, currentUserId, page)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ UserSearch.searchUsers: Error occurred:',
					error
				);
				throw error;
			});
	};

	getUserProfile = async (userId: string, currentUserId: string) => {
		return this.userSearch
			.getUserProfile(userId, currentUserId)
			.then((user) => {
				return user;
			})
			.catch((error) => {
				console.error(
					'❌ UserSearch.getUserProfile: Error occurred:',
					error
				);
				throw error;
			});
	};

	getUserSneakers = async (userId: string) => {
		return this.userSearch
			.getUserSneakers(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ UserSearch.getUserSneakers: Error occurred:',
					error
				);
				throw error;
			});
	};
}
