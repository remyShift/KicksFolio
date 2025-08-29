import { useCallback, useEffect, useRef } from 'react';

import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';

interface UseModalNavigationProps {
	contextSneakers?: Sneaker[];
}

export const useModalNavigation = ({
	contextSneakers,
}: UseModalNavigationProps = {}) => {
	const { userSneakers } = useSession();
	const { modalStep, currentSneaker, setNextSneaker, setPrevSneaker } =
		useModalStore();

	const lastProcessedSneakerId = useRef<string | null>(null);

	const getSneakersForNavigation = useCallback(() => {
		if (!currentSneaker) return null;

		if (contextSneakers && contextSneakers.length > 0) {
			return contextSneakers;
		}

		return userSneakers;
	}, [currentSneaker, contextSneakers, userSneakers]);

	useEffect(() => {
		if (modalStep === 'view' && currentSneaker) {
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
			if (modalStep !== 'view') {
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
