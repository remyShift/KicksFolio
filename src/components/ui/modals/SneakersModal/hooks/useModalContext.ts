import { useCallback } from 'react';

import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';

interface UseModalContextProps {
	contextSneakers?: Sneaker[];
}

export const useModalContext = ({
	contextSneakers,
}: UseModalContextProps = {}) => {
	const setCurrentSneaker = useModalStore((state) => state.setCurrentSneaker);
	const setModalStep = useModalStore((state) => state.setModalStep);
	const setIsVisible = useModalStore((state) => state.setIsVisible);
	const setContextSneakers = useModalStore(
		(state) => state.setContextSneakers
	);
	const resetModalData = useModalStore((state) => state.resetModalData);

	const isWishlistSneaker = useCallback((sneaker: Sneaker) => {
		return (
			sneaker.wishlist === true ||
			sneaker.wishlist_added_at != null ||
			(sneaker.condition == null &&
				sneaker.status_id == null &&
				sneaker.size_eu == null &&
				sneaker.size_us == null)
		);
	}, []);

	const openSneakerModal = useCallback(
		(sneaker: Sneaker) => {
			setContextSneakers(contextSneakers || null);
			setCurrentSneaker(sneaker);
			const modalStep = isWishlistSneaker(sneaker)
				? 'wishlist-view'
				: 'view';
			setModalStep(modalStep);
			setIsVisible(true);
		},
		[
			setCurrentSneaker,
			setModalStep,
			setIsVisible,
			setContextSneakers,
			contextSneakers,
			isWishlistSneaker,
		]
	);

	const openModalForNewSneaker = useCallback(() => {
		resetModalData();
		setModalStep('index');
		setIsVisible(true);
	}, [resetModalData, setModalStep, setIsVisible]);

	return {
		openSneakerModal,
		openModalForNewSneaker,
	};
};
