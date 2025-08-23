import { SneakerStatus } from './sneaker';

export type SortOption = 'name' | 'brand' | 'size' | 'condition' | 'value';
export type SortOrder = 'asc' | 'desc';

export interface Filter {
	brand?: string;
	size?: number;
	condition?: number;
	status_id?: number;
}

export interface FilterState {
	brands: string[];
	sizes: string[];
	conditions: string[];
	statuses: number[];
}

export interface UniqueValues {
	brands: string[];
	sizes: string[];
	conditions: string[];
	statuses: number[];
}
