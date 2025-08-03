import { FollowingUser } from '@/domain/FollowerProvider';
import { SearchUser } from '@/domain/UserSearchProvider';

export interface FollowerInterface {
	followUser: (followingId: string) => Promise<boolean>;
	unfollowUser: (followingId: string) => Promise<boolean>;
	getFollowingUsers: (userId: string) => Promise<FollowingUser[]>;
	getFollowersOfUser: (userId: string) => Promise<SearchUser[]>;
	isFollowing: (followerId: string, followingId: string) => Promise<boolean>;
	getFollowCounts: (
		userId: string
	) => Promise<{ followers: number; following: number }>;
}

export class FollowerInterface {
	static followUser = async (
		followingId: string,
		followFunction: FollowerInterface['followUser']
	) => {
		return followFunction(followingId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerInterface.followUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	static unfollowUser = async (
		followingId: string,
		unfollowFunction: FollowerInterface['unfollowUser']
	) => {
		return unfollowFunction(followingId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerInterface.unfollowUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getFollowingUsers = async (
		userId: string,
		getFollowingFunction: FollowerInterface['getFollowingUsers']
	) => {
		return getFollowingFunction(userId)
			.then((users) => {
				return users;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerInterface.getFollowingUsers: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getFollowersOfUser = async (
		userId: string,
		getFollowersFunction: FollowerInterface['getFollowersOfUser']
	) => {
		return getFollowersFunction(userId)
			.then((users) => {
				return users;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerInterface.getFollowersOfUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	static isFollowing = async (
		followerId: string,
		followingId: string,
		isFollowingFunction: FollowerInterface['isFollowing']
	) => {
		return isFollowingFunction(followerId, followingId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerInterface.isFollowing: Error occurred:',
					error
				);
				throw error;
			});
	};

	static getFollowCounts = async (
		userId: string,
		getFollowCountsFunction: FollowerInterface['getFollowCounts']
	) => {
		return getFollowCountsFunction(userId)
			.then((counts) => {
				return counts;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerInterface.getFollowCounts: Error occurred:',
					error
				);
				throw error;
			});
	};
}
