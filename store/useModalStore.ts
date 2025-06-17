import { create } from 'zustand';
import {
	ModalStep,
	SneakerFormData,
} from '@/components/modals/SneakersModal/types';
import { Sneaker } from '@/types/Sneaker';

export interface FetchedSneaker {
	model: string;
	brand: string;
	description: string;
	image: {
		url: string;
	};
}

interface ModalStore {
	modalStep: ModalStep;
	isVisible: boolean;
	currentSneaker: Sneaker | null;
	sneakerToAdd: SneakerFormData | null;
	fetchedSneaker: FetchedSneaker | null;
	sneakerSKU: string;
	errorMsg: string;
	validateForm:
		| (() => Promise<{
				isValid: boolean;
				errorMsg: string;
				data?: SneakerFormData;
		  }>)
		| null;
	clearFormErrors: (() => void) | null;

	setModalStep: (step: ModalStep) => void;
	setIsVisible: (isVisible: boolean) => void;
	setCurrentSneaker: (sneaker: Sneaker | null) => void;
	setSneakerToAdd: (sneaker: SneakerFormData | null) => void;
	setFetchedSneaker: (sneaker: FetchedSneaker | null) => void;
	setSneakerSKU: (sku: string) => void;
	setErrorMsg: (error: string) => void;
	setValidateForm: (
		fn:
			| (() => Promise<{
					isValid: boolean;
					errorMsg: string;
					data?: SneakerFormData;
			  }>)
			| null
	) => void;
	setClearFormErrors: (fn: (() => void) | null) => void;
	resetModalData: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
	modalStep: 'index' as ModalStep,
	isVisible: false,
	currentSneaker: null,
	sneakerToAdd: null,
	fetchedSneaker: null,
	sneakerSKU: '',
	errorMsg: '',
	validateForm: null,
	clearFormErrors: null,

	setModalStep: (step) => set({ modalStep: step }),
	setIsVisible: (isVisible) => set({ isVisible }),
	setCurrentSneaker: (sneaker) => set({ currentSneaker: sneaker }),
	setSneakerToAdd: (sneaker) => set({ sneakerToAdd: sneaker }),
	setFetchedSneaker: (sneaker) => set({ fetchedSneaker: sneaker }),
	setSneakerSKU: (sku) => set({ sneakerSKU: sku }),
	setErrorMsg: (error) => set({ errorMsg: error }),
	setValidateForm: (fn) => set({ validateForm: fn }),
	setClearFormErrors: (fn) => set({ clearFormErrors: fn }),
	resetModalData: () =>
		set({
			sneakerToAdd: null,
			fetchedSneaker: null,
			currentSneaker: null,
			errorMsg: '',
			sneakerSKU: '',
		}),
}));
