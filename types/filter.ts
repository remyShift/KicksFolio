import { SneakerBrand, SneakerStatus } from './sneaker';

export type SortOption = 'name' | 'brand' | 'size' | 'condition' | 'value';

export interface Filter {
	brand?: SneakerBrand;
	size?: number;
	condition?: number;
	status?: SneakerStatus;
}
