import { FilterState } from './filter';
import { Sneaker } from './sneaker';
import { SearchUser } from './user';

export interface SharedCollection {
	id: string;
	user_id: string;
	share_token: string;
	filters: FilterState;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface ShareableLink {
	share_token: string;
	filters: FilterState;
	url: string;
}

export interface SharedCollectionData {
	user_data: SearchUser;
	sneakers_data: Sneaker[];
	filters: FilterState;
}

export interface CreateSharedCollectionRequest {
	filters: FilterState;
}

export interface CreateSharedCollectionResponse {
	share_token: string;
	url: string;
}

export interface ShareCollectionModalFilters extends FilterState {
	tempBrands: string[];
	tempSizes: string[];
	tempConditions: string[];
	tempStatuses: number[];
}
