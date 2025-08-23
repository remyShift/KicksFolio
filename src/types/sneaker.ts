import { SneakerPhoto } from './image';

export interface Brand {
	id: number;
	name: string;
}

export enum BrandId {
	Nike = 1,
	Adidas = 2,
	Converse = 3,
	NewBalance = 4,
	Puma = 5,
	Jordan = 6,
	Asics = 7,
	Reebok = 8,
	Vans = 9,
	Other = 10,
}

export type SizeUnit = 'US' | 'EU';

export type GenderType = 'men' | 'women';

export interface SizeMapping {
	usMen: number;
	usWomen: number;
	eu: number;
}

export enum SneakerStatus {
	ROCKING = 1,
	SELLING = 2,
	STOCKING = 3,
}

export type SneakerOwner = {
	id: string;
	username: string;
	first_name?: string;
	last_name?: string;
	profile_picture_url?: string;
};

export type Sneaker = {
	id: string;
	sneaker_id?: string;
	user_id: string;
	model: string;
	brand_id: number;
	brand?: Brand;
	sku?: string;
	price_paid?: number;
	size_eu: number;
	size_us: number;
	condition: number;
	status_id: number;
	description: string | null;
	images: SneakerPhoto[];
	estimated_value?: number;
	owner?: SneakerOwner;
	wishlist_added_at?: string;
	wishlist?: boolean | false;
	gender?: string;
	og_box?: boolean;
	ds?: boolean;
};

export const getBrandIdByName = (brandName: string): number => {
	switch (brandName) {
		case 'Nike':
			return BrandId.Nike;
		case 'Adidas':
			return BrandId.Adidas;
		case 'Converse':
			return BrandId.Converse;
		case 'New Balance':
			return BrandId.NewBalance;
		case 'Puma':
			return BrandId.Puma;
		case 'Jordan':
			return BrandId.Jordan;
		case 'Asics':
			return BrandId.Asics;
		case 'Reebok':
			return BrandId.Reebok;
		case 'Vans':
			return BrandId.Vans;
		case 'Other':
		default:
			return BrandId.Other;
	}
};
