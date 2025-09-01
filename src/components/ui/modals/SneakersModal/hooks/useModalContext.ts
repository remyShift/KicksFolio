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
	// Retour aux sélecteurs individuels pour éviter la boucle infinie
	const setCurrentSneaker = useModalStore((state) => state.setCurrentSneaker);
	const setModalStep = useModalStore((state) => state.setModalStep);
	const setIsVisible = useModalStore((state) => state.setIsVisible);
	const resetModalData = useModalStore((state) => state.resetModalData);

	const openSneakerModal = useCallback(
		(sneaker: Sneaker) => {
			setCurrentSneaker(sneaker);
			setModalStep('view');
			setIsVisible(true);
		},
		[setCurrentSneaker, setModalStep, setIsVisible]
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
