import { useCallback, useState } from 'react';

import { shareHandler } from '@/d/Share';
import { FilterState } from '@/types/filter';
import { ShareModalState } from '@/types/share-modal';

export const useShareCollection = (userId: string) => {
	const [modalState, setModalState] = useState<ShareModalState>({
		isVisible: false,
		isLoading: false,
		shareUrl: null,
		hasSharedBefore: false,
	});

	const toggleModal = useCallback(() => {
		setModalState((prev) => ({
			...prev,
			isVisible: !prev.isVisible,
			shareUrl: prev.isVisible ? null : prev.shareUrl,
		}));
	}, []);

	const createShareLink = useCallback(
		async (filters: FilterState) => {
			setModalState((prev) => ({ ...prev, isLoading: true }));

			try {
				const response = await shareHandler.createShareLink(
					userId,
					filters
				);

				setModalState((prev) => ({
					...prev,
					isLoading: false,
					shareUrl: response.url,
					hasSharedBefore: true,
				}));

				return response;
			} catch (error) {
				setModalState((prev) => ({ ...prev, isLoading: false }));
				throw error;
			}
		},
		[userId]
	);

	const copyToClipboard = useCallback(async () => {
		if (!modalState.shareUrl) return;

		try {
			const { setStringAsync } = await import('expo-clipboard');
			await setStringAsync(modalState.shareUrl);
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
			throw error;
		}
	}, [modalState.shareUrl]);

	return {
		modalState,
		toggleModal,
		createShareLink,
		copyToClipboard,
	};
};
