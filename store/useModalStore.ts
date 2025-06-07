import { create } from 'zustand';
import { ModalStep } from '@/components/modals/SneakersModal/types';
import { Sneaker } from '@/types/Sneaker';

interface ApiSneakerResponse {
	id: string;
	name: string;
	brand: string;
	sku: string;
	estimatedMarketValue: number;
	releaseDate: string;
	image: {
		original: string;
		small: string;
		thumbnail: string;
		360: string[];
	};
	colorway: string;
	gender: string;
	silhouette: string;
	releaseYear: string;
	retailPrice: number;
	story: string;
	links: {
		flightClub: string;
		goat: string;
		stadiumGoods: string;
		stockX: string;
	};
}

interface ModalStore {
	modalStep: ModalStep;
	isVisible: boolean;
	currentSneaker: Sneaker | null;
	sneakerSKU: string;
	errorMsg: string;
	modalSessionToken: string | null;

	setModalStep: (step: ModalStep) => void;
	setIsVisible: (isVisible: boolean) => void;
	setSneakerFetchedInformation: (sneaker: Sneaker | null) => void;
	setSneakerSKU: (sku: string) => void;
	setErrorMsg: (error: string) => void;
	setModalSessionToken: (token: string | null) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
	modalStep: 'index' as ModalStep,
	isVisible: false,
	currentSneaker: null,
	sneakerSKU: '',
	errorMsg: '',
	modalSessionToken: null,

	setModalStep: (step) => set({ modalStep: step }),
	setIsVisible: (isVisible) => set({ isVisible }),
	setSneakerFetchedInformation: (sneaker) => set({ currentSneaker: sneaker }),
	setSneakerSKU: (sku) => set({ sneakerSKU: sku }),
	setErrorMsg: (error) => set({ errorMsg: error }),
	setModalSessionToken: (token) => set({ modalSessionToken: token }),
}));
