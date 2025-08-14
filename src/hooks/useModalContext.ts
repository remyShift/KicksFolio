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
	const { userSneakers } = useSession();
	const { setCurrentSneaker, setModalStep, setIsVisible } = useModalStore();

	const openSneakerModal = useCallback(
		(sneaker: Sneaker) => {
			setCurrentSneaker(sneaker);
			setModalStep('view');
			setIsVisible(true);
		},
		[
			contextSneakers,
			userSneakers,
			setCurrentSneaker,
			setModalStep,
			setIsVisible,
		]
	);

	return {
		openSneakerModal,
	};
};
