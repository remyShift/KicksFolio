import { FollowingUser, SearchUser } from '@/types/user';

export interface FollowerHandlerInterface {
	follow: (userToFollowId: string) => Promise<boolean>;
	unfollow: (userToUnfollowId: string) => Promise<boolean>;
	getFollowing: (userId: string) => Promise<FollowingUser[]>;
	getFollowers: (userId: string) => Promise<SearchUser[]>;
	isFollowing: (followerId: string, followingId: string) => Promise<boolean>;
	getFollowCounts: (
		userId: string
	) => Promise<{ followers: number; following: number }>;
}

export class FollowerHandler {
	constructor(private readonly followerProvider: FollowerHandlerInterface) {}

	follow = async (userToFollowId: string) => {
		return this.followerProvider
			.follow(userToFollowId)
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

	unfollow = async (userToUnfollowId: string) => {
		return this.followerProvider
			.unfollow(userToUnfollowId)
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

	getFollowing = async (userId: string) => {
		return this.followerProvider
			.getFollowing(userId)
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

	getFollowers = async (userId: string) => {
		return this.followerProvider
			.getFollowers(userId)
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
