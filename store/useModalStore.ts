import { create } from 'zustand';
import { ModalStep } from '@/components/modals/SneakersModal/types';
import { Sneaker } from '@/types/Sneaker';

export interface FetchedSneaker {
	model: string;
	brand: string;
	description: string;
	image: {
		url: string;
	};
}

export interface SneakerToAdd {
	model: string;
	brand: string;
	status: string;
	size: string;
	condition: string;
	price_paid?: string;
	description?: string;
	images: {
		url: string;
	}[];
}

interface ModalStore {
	modalStep: ModalStep;
	isVisible: boolean;
	currentSneaker: Sneaker | null;
	sneakerToAdd: SneakerToAdd | null;
	fetchedSneaker: FetchedSneaker | null;
	sneakerSKU: string;
	errorMsg: string;
	modalSessionToken: string | null;

	setModalStep: (step: ModalStep) => void;
	setIsVisible: (isVisible: boolean) => void;
	setCurrentSneaker: (sneaker: Sneaker | null) => void;
	setSneakerToAdd: (sneaker: SneakerToAdd | null) => void;
	setFetchedSneaker: (sneaker: FetchedSneaker | null) => void;
	setSneakerSKU: (sku: string) => void;
	setErrorMsg: (error: string) => void;
	setModalSessionToken: (token: string | null) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
	modalStep: 'index' as ModalStep,
	isVisible: false,
	currentSneaker: null,
	sneakerToAdd: null,
	fetchedSneaker: null,
	sneakerSKU: '',
	errorMsg: '',
	modalSessionToken: null,

	setModalStep: (step) => set({ modalStep: step }),
	setIsVisible: (isVisible) => set({ isVisible }),
	setCurrentSneaker: (sneaker) => set({ currentSneaker: sneaker }),
	setSneakerToAdd: (sneaker) => set({ sneakerToAdd: sneaker }),
	setFetchedSneaker: (sneaker) => set({ fetchedSneaker: sneaker }),
	setSneakerSKU: (sku) => set({ sneakerSKU: sku }),
	setErrorMsg: (error) => set({ errorMsg: error }),
	setModalSessionToken: (token) => set({ modalSessionToken: token }),
}));
