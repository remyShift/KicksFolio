import { create } from 'zustand';

import { ModalStep } from '@/components/ui/modals/SneakersModal/types';
import { Sneaker } from '@/types/sneaker';
import { SneakerFormData } from '@/validation/sneaker';

export interface FetchedSneaker {
	model: string;
	brand: string;
	description: string;
	image: {
		uri: string;
	};
	estimated_value: number;
	gender?: string;
	sku: string;
}

interface ModalStore {
	modalStep: ModalStep;
	isVisible: boolean;
	currentSneaker: Sneaker | null;
	nextSneaker: Sneaker | null;
	prevSneaker: Sneaker | null;
	sneakerToAdd: SneakerFormData | null;
	fetchedSneaker: FetchedSneaker | null;
	sneakerSKU: string;
	errorMsg: string;
	estimatedValue: number | null;
	gender: string | null;
	sku: string | null;
	isLoading: boolean;
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
	setNextSneaker: (sneaker: Sneaker | null) => void;
	setPrevSneaker: (sneaker: Sneaker | null) => void;
	setSneakerToAdd: (sneaker: SneakerFormData | null) => void;
	setFetchedSneaker: (sneaker: FetchedSneaker | null) => void;
	setSneakerSKU: (sku: string) => void;
	setErrorMsg: (error: string) => void;
	setEstimatedValue: (value: number | null) => void;
	setGender: (gender: string | null) => void;
	setSku: (sku: string | null) => void;
	setIsLoading: (isLoading: boolean) => void;
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
	nextSneaker: null,
	prevSneaker: null,
	sneakerToAdd: null,
	fetchedSneaker: null,
	sneakerSKU: '',
	errorMsg: '',
	estimatedValue: null,
	gender: null,
	sku: null,
	isLoading: false,
	validateForm: null,
	clearFormErrors: null,

	setModalStep: (step) => {
		set({ modalStep: step });
	},
	setIsVisible: (isVisible) => {
		set({ isVisible });
	},
	setCurrentSneaker: (sneaker) => {
		set({ currentSneaker: sneaker });
	},
	setNextSneaker: (sneaker) => {
		set({ nextSneaker: sneaker });
	},
	setPrevSneaker: (sneaker) => {
		set({ prevSneaker: sneaker });
	},
	setSneakerToAdd: (sneaker) => set({ sneakerToAdd: sneaker }),
	setFetchedSneaker: (sneaker) => set({ fetchedSneaker: sneaker }),
	setSneakerSKU: (sku) => set({ sneakerSKU: sku }),
	setErrorMsg: (error) => set({ errorMsg: error }),
	setEstimatedValue: (value) => set({ estimatedValue: value }),
	setGender: (gender) => set({ gender }),
	setSku: (sku) => set({ sku }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setValidateForm: (fn) => set({ validateForm: fn }),
	setClearFormErrors: (fn) => set({ clearFormErrors: fn }),
	resetModalData: () => {
		set({
			currentSneaker: null,
			nextSneaker: null,
			prevSneaker: null,
			modalStep: 'index',
			sneakerToAdd: null,
			fetchedSneaker: null,
			errorMsg: '',
			sneakerSKU: '',
			estimatedValue: null,
			gender: null,
			sku: null,
			isLoading: false,
		});
	},
}));
