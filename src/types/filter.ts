import { SneakerBrand, SneakerStatus } from './sneaker';

export type SortOption = 'name' | 'brand' | 'size' | 'condition' | 'value';
export type SortOrder = 'asc' | 'desc';

export interface Filter {
	brand?: SneakerBrand;
	size?: number;
	condition?: number;
	status?: SneakerStatus;
}

export interface FilterState {
	brands: string[];
	sizes: string[];
	conditions: string[];
	statuses?: string[];
}

export interface UniqueValues {
	brands: string[];
	sizes: string[];
	conditions: string[];
	statuses: string[];
}
