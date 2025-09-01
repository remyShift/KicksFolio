import { useCallback, useEffect, useRef } from 'react';

import { useSession } from '@/contexts/authContext';
import { useLocalSneakerData } from '@/hooks/useLocalSneakerData';
import { useModalStore } from '@/store/useModalStore';
import {
	useViewDisplayStateStore,
	ViewDisplayState,
} from '@/store/useViewDisplayStateStore';
import { Sneaker } from '@/types/sneaker';
import { flattenSneakersByBrandOrder } from '@/utils/sneakerGrouping';

interface UseModalNavigationProps {
	contextSneakers?: Sneaker[];
}

export const useModalNavigation = ({
	contextSneakers,
}: UseModalNavigationProps = {}) => {
	const { userSneakers } = useSession();
	const { viewDisplayState } = useViewDisplayStateStore();
	const {
		modalStep,
		currentSneaker,
		contextSneakers: storeContextSneakers,
		setNextSneaker,
		setPrevSneaker,
	} = useModalStore();

	const lastProcessedSneakerId = useRef<string | null>(null);

	const baseSneakers =
		storeContextSneakers && storeContextSneakers.length > 0
			? storeContextSneakers
			: contextSneakers && contextSneakers.length > 0
				? contextSneakers
				: userSneakers || [];

	const { filteredAndSortedSneakers } = useLocalSneakerData(baseSneakers);

	const getSneakersForNavigation = useCallback(() => {
		if (!currentSneaker) return null;

		const isCardView = viewDisplayState === ViewDisplayState.Card;

		if (isCardView) {
			return flattenSneakersByBrandOrder(filteredAndSortedSneakers);
		} else {
			return filteredAndSortedSneakers;
		}
	}, [currentSneaker, viewDisplayState, filteredAndSortedSneakers]);

	useEffect(() => {
		if (
			(modalStep === 'view' || modalStep === 'wishlist-view') &&
			currentSneaker
		) {
			if (lastProcessedSneakerId.current === currentSneaker.id) {
				return;
			}

			const sneakersToUse = getSneakersForNavigation();

			if (sneakersToUse) {
				const currentIndex = sneakersToUse.findIndex(
					(s: Sneaker) => s.id === currentSneaker.id
				);

				if (currentIndex !== -1) {
					const nextIndex = (currentIndex + 1) % sneakersToUse.length;
					const prevIndex =
						(currentIndex - 1 + sneakersToUse.length) %
						sneakersToUse.length;

					const nextSneaker = sneakersToUse[nextIndex];
					const prevSneaker = sneakersToUse[prevIndex];

					setNextSneaker(nextSneaker);
					setPrevSneaker(prevSneaker);

					lastProcessedSneakerId.current = currentSneaker.id;
				}
			}
		}

		return () => {
			if (modalStep !== 'view' && modalStep !== 'wishlist-view') {
				setNextSneaker(null);
				setPrevSneaker(null);
				lastProcessedSneakerId.current = null;
			}
		};
	}, [
		currentSneaker?.id,
		modalStep,
		getSneakersForNavigation,
		setNextSneaker,
		setPrevSneaker,
	]);

	return {
		getSneakersForNavigation,
	};
};
