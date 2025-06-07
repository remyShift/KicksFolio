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

const transformToSneaker = (data: any): Sneaker => {
	if (data.model && data.images) {
		return {
			id: data.id || '',
			model: data.model,
			brand: data.brand,
			status: data.status || '',
			size: data.size || 0,
			condition: data.condition || 0,
			images: data.images || [],
			price_paid: data.price_paid || 0,
			description: data.description || '',
			collection_id: data.collection_id || '',
			purchase_date: data.purchase_date || new Date().toISOString(),
			estimated_value: data.estimated_value || 0,
			release_date: data.release_date || null,
			created_at: data.created_at || new Date().toISOString(),
			updated_at: data.updated_at || new Date().toISOString(),
		};
	}

	return {
		id: '',
		model: data.name || '',
		brand: data.brand || '',
		status: '',
		size: 0,
		condition: 0,
		images: data.image
			? [{ id: '', url: data.image.small || data.image.original || '' }]
			: [],
		price_paid: 0,
		description: data.story || '',
		collection_id: '',
		purchase_date: new Date().toISOString(),
		estimated_value: data.estimatedMarketValue || 0,
		release_date: data.releaseDate || null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
};

interface ModalStore {
	modalStep: ModalStep;
	isVisible: boolean;
	currentSneaker: Sneaker | null;
	sneakerSKU: string;
	errorMsg: string;
	modalSessionToken: string | null;
	skuSearchCallback: (() => void) | null;

	setModalStep: (step: ModalStep) => void;
	setIsVisible: (isVisible: boolean) => void;
	setSneakerFetchedInformation: (sneaker: Sneaker | null) => void;
	setSneakerSKU: (sku: string) => void;
	setErrorMsg: (error: string) => void;
	setModalSessionToken: (token: string | null) => void;
	setSkuSearchCallback: (callback: (() => void) | null) => void;

	handleSkuSearchSuccess: (data: any) => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
	modalStep: 'index' as ModalStep,
	isVisible: false,
	currentSneaker: null,
	sneakerSKU: '',
	errorMsg: '',
	modalSessionToken: null,
	skuSearchCallback: null,

	setModalStep: (step) => set({ modalStep: step }),
	setIsVisible: (isVisible) => set({ isVisible }),
	setSneakerFetchedInformation: (sneaker) => set({ currentSneaker: sneaker }),
	setSneakerSKU: (sku) => set({ sneakerSKU: sku }),
	setErrorMsg: (error) => set({ errorMsg: error }),
	setModalSessionToken: (token) => set({ modalSessionToken: token }),
	setSkuSearchCallback: (callback) => set({ skuSearchCallback: callback }),

	handleSkuSearchSuccess: (data: any) => {
		const transformedSneaker = transformToSneaker(data);
		set({
			currentSneaker: transformedSneaker,
			modalStep: 'addForm',
			errorMsg: '',
		});
	},
}));
