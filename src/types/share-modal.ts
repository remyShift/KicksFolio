import { FilterState, UniqueValues } from './filter';

export interface ShareModalState {
	isVisible: boolean;
	isLoading: boolean;
	shareUrl: string | null;
	hasSharedBefore: boolean;
}

export interface ShareModalFilters {
	applied: FilterState;
	temp: FilterState;
	available: UniqueValues;
}

export interface ShareModalActions {
	toggleModal: () => void;
	updateTempFilter: (filterType: keyof FilterState, values: string[]) => void;
	clearTempFilters: () => void;
	applyFilters: () => void;
	createShareLink: () => Promise<void>;
	copyToClipboard: () => Promise<void>;
}
