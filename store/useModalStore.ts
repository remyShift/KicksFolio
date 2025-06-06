import { create } from 'zustand';
import { ModalStep } from '@/components/modals/SneakersModal/types';
import { Sneaker } from '@/types/Sneaker';
import { useSneakerAPI } from '@/components/modals/SneakersModal/hooks/useSneakerAPI';

interface ModalStore {
	modalStep: ModalStep;
	isVisible: boolean;
	currentSneaker: Sneaker | null;
	sneakerSKU: string;
	errorMsg: string;

	setModalStep: (step: ModalStep) => void;
	setIsVisible: (isVisible: boolean) => void;
	setCurrentSneaker: (sneaker: Sneaker | null) => void;
	setSneakerSKU: (sku: string) => void;
	setErrorMsg: (msg: string) => void;

	handleNext: () => void;
	handleBack: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
	modalStep: 'index',
	isVisible: false,
	currentSneaker: null,
	sneakerSKU: '',
	errorMsg: '',

	setModalStep: (step) => set({ modalStep: step }),
	setIsVisible: (isVisible) => set({ isVisible }),
	setCurrentSneaker: (sneaker) => set({ currentSneaker: sneaker }),
	setSneakerSKU: (sku) => set({ sneakerSKU: sku }),
	setErrorMsg: (msg) => set({ errorMsg: msg }),

	handleNext: () => {
		const {
			modalStep,
			sneakerSKU,
			setErrorMsg,
			setCurrentSneaker,
			setModalStep,
		} = get();
		const sessionToken = localStorage.getItem('sessionToken');

		switch (modalStep) {
			case 'index':
				setModalStep('sku');
				break;
			case 'sku':
				if (!sneakerSKU) {
					setErrorMsg('Please enter a SKU');
					return;
				}
				const { handleSkuLookup } = useSneakerAPI(sessionToken || null);
				handleSkuLookup(
					sneakerSKU,
					setCurrentSneaker,
					setModalStep,
					setErrorMsg
				);
				break;
			case 'addForm':
				setModalStep('view');
				break;
			case 'view':
				set({ isVisible: false, modalStep: 'index' });
				break;
		}
	},

	handleBack: () => {
		const { modalStep, setModalStep } = get();

		switch (modalStep) {
			case 'sku':
				setModalStep('index');
				break;
			case 'addForm':
				setModalStep('sku');
				break;
			case 'view':
				setModalStep('addForm');
				break;
		}
	},
}));
