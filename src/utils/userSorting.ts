import { FollowingUserWithSneakers } from '@/types/auth';

const getLatestSneakerDate = (user: FollowingUserWithSneakers): Date | null => {
	if (!user.sneakers || user.sneakers.length === 0) {
		return null;
	}

	const latestCreatedAt = user.sneakers
		.filter((sneaker) => sneaker.created_at)
		.map((sneaker) => sneaker.created_at!)
		.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

	return latestCreatedAt ? new Date(latestCreatedAt) : null;
};

export const sortUsersByLatestSneakerAddition = (
	users: FollowingUserWithSneakers[]
): FollowingUserWithSneakers[] => {
	return [...users].sort((userA, userB) => {
		const dateA = getLatestSneakerDate(userA);
		const dateB = getLatestSneakerDate(userB);

		if (!dateA && !dateB) return 0;
		if (!dateA) return 1;
		if (!dateB) return -1;

		return dateB.getTime() - dateA.getTime();
	});
};
