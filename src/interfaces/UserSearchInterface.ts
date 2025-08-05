import {
	SearchUser,
	SearchUsersResponse,
} from '@/src/domain/UserSearchProvider';

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

export class UserSearchInterface {
	static searchUsers = async (
		searchTerm: string,
		currentUserId: string,
		page: number = 0,
		searchFunction: UserSearchInterface['searchUsers']
	) => {
		return searchFunction(searchTerm, currentUserId, page)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				console.error(
					'❌ UserSearchInterface.searchUsers: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getUserProfile = async (
		userId: string,
		currentUserId: string,
		getUserProfileFunction: UserSearchInterface['getUserProfile']
	) => {
		return getUserProfileFunction(userId, currentUserId)
			.then((user) => {
				return user;
			})
			.catch((error) => {
				console.error(
					'❌ UserSearchInterface.getUserProfile: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getUserSneakers = async (
		userId: string,
		getUserSneakersFunction: UserSearchInterface['getUserSneakers']
	) => {
		return getUserSneakersFunction(userId)
			.then((sneakers) => {
				return sneakers;
			})
			.catch((error) => {
				console.error(
					'❌ UserSearchInterface.getUserSneakers: Error occurred:',
					error
				);
				throw error;
			});
	};
}
