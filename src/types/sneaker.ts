import { SneakerPhoto } from './image';

export enum SneakerBrand {
	Nike = 'Nike',
	Adidas = 'Adidas',
	Converse = 'Converse',
	NewBalance = 'New Balance',
	Puma = 'Puma',
	Jordan = 'Jordan',
	Asics = 'Asics',
	Reebok = 'Reebok',
	Vans = 'Vans',
	Other = 'Other',
	null = 'null',
}

export type SizeUnit = 'US' | 'EU';

export type GenderType = 'men' | 'women';

export interface SizeMapping {
	usMen: number;
	usWomen: number;
	eu: number;
}

export enum SneakerStatus {
	Stocking = 'Stocking',
	Rocking = 'Rocking',
	Selling = 'Selling',
	null = 'null',
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
	user_id: string;
	model: string;
	brand: SneakerBrand;
	sku?: string;
	price_paid?: number;
	size_eu: number;
	size_us: number;
	condition: number;
	status: SneakerStatus;
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
