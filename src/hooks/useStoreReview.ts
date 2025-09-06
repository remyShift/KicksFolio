import { useCallback } from 'react';

import * as StoreReview from 'expo-store-review';

import { useStorageState } from './useStorageState';

const REVIEW_STORAGE_KEY = 'store_review_data';
const MIN_SNEAKERS_BEFORE_REVIEW = 3;
const DAYS_BETWEEN_REQUESTS = 30;

interface ReviewData {
	lastRequestDate?: string;
	sneakersAddedSinceLastRequest: number;
	hasUserDeclined: boolean;
}

export const useStoreReview = () => {
	const [[isLoading, reviewDataString], setReviewDataString] =
		useStorageState(REVIEW_STORAGE_KEY);

	const getReviewData = useCallback((): ReviewData => {
		if (!reviewDataString) {
			return {
				sneakersAddedSinceLastRequest: 0,
				hasUserDeclined: false,
			};
		}
		try {
			return JSON.parse(reviewDataString);
		} catch {
			return {
				sneakersAddedSinceLastRequest: 0,
				hasUserDeclined: false,
			};
		}
	}, [reviewDataString]);

	const updateReviewData = useCallback(
		(data: Partial<ReviewData>) => {
			const currentData = getReviewData();
			const newData = { ...currentData, ...data };
			setReviewDataString(JSON.stringify(newData));
		},
		[getReviewData, setReviewDataString]
	);

	const shouldRequestReview = useCallback((): boolean => {
		const data = getReviewData();

		if (data.hasUserDeclined) {
			return false;
		}

		if (data.sneakersAddedSinceLastRequest < MIN_SNEAKERS_BEFORE_REVIEW) {
			return false;
		}

		if (data.lastRequestDate) {
			const lastRequest = new Date(data.lastRequestDate);
			const daysSinceLastRequest =
				(Date.now() - lastRequest.getTime()) / (1000 * 60 * 60 * 24);

			if (daysSinceLastRequest < DAYS_BETWEEN_REQUESTS) {
				return false;
			}
		}

		return true;
	}, [getReviewData]);

	const requestReview = useCallback(async () => {
		try {
			const isAvailable = await StoreReview.isAvailableAsync();
			if (!isAvailable) {
				return false;
			}

			await StoreReview.requestReview();

			updateReviewData({
				lastRequestDate: new Date().toISOString(),
				sneakersAddedSinceLastRequest: 0,
			});

			return true;
		} catch (error) {
			console.error('Error requesting store review:', error);
			return false;
		}
	}, [updateReviewData]);

	const incrementSneakerCount = useCallback(() => {
		const data = getReviewData();
		updateReviewData({
			sneakersAddedSinceLastRequest:
				data.sneakersAddedSinceLastRequest + 1,
		});
	}, [getReviewData, updateReviewData]);

	const markAsDeclined = useCallback(() => {
		updateReviewData({ hasUserDeclined: true });
	}, [updateReviewData]);

	return {
		shouldRequestReview,
		requestReview,
		incrementSneakerCount,
		markAsDeclined,
	};
};
