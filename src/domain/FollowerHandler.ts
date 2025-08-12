import { FollowingUser, SearchUser } from '@/types/user';

export interface FollowerHandlerInterface {
	followUser: (followingId: string) => Promise<boolean>;
	unfollowUser: (followingId: string) => Promise<boolean>;
	getFollowingUsers: (userId: string) => Promise<FollowingUser[]>;
	getFollowersOfUser: (userId: string) => Promise<SearchUser[]>;
	isFollowing: (followerId: string, followingId: string) => Promise<boolean>;
	getFollowCounts: (
		userId: string
	) => Promise<{ followers: number; following: number }>;
}

export class FollowerHandler {
	constructor(private readonly followerProvider: FollowerHandlerInterface) {}

	followUser = async (followingId: string) => {
		return this.followerProvider
			.followUser(followingId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerHandler.followUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	unfollowUser = async (followingId: string) => {
		return this.followerProvider
			.unfollowUser(followingId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerHandler.unfollowUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	getFollowingUsers = async (userId: string) => {
		return this.followerProvider
			.getFollowingUsers(userId)
			.then((users) => {
				return users;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerHandler.getFollowingUsers: Error occurred:',
					error
				);
				throw error;
			});
	};

	getFollowersOfUser = async (userId: string) => {
		return this.followerProvider
			.getFollowersOfUser(userId)
			.then((users) => {
				return users;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerHandler.getFollowersOfUser: Error occurred:',
					error
				);
				throw error;
			});
	};

	isFollowing = async (followerId: string, followingId: string) => {
		return this.followerProvider
			.isFollowing(followerId, followingId)
			.then((result) => {
				return result;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerHandler.isFollowing: Error occurred:',
					error
				);
				throw error;
			});
	};

	getFollowCounts = async (userId: string) => {
		return this.followerProvider
			.getFollowCounts(userId)
			.then((counts) => {
				return counts;
			})
			.catch((error) => {
				console.error(
					'❌ FollowerHandler.getFollowCounts: Error occurred:',
					error
				);
				throw error;
			});
	};
}
