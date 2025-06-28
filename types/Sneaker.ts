export enum SneakerBrand {
	Nike = 'Nike',
	Adidas = 'Adidas',
	Converse = 'Converse',
	NewBalance = 'New Balance',
	Puma = 'Puma',
	Jordan = 'Jordan',
	Yeezy = 'Yeezy',
	Asics = 'Asics',
	Reebok = 'Reebok',
	Vans = 'Vans',
	Other = 'Other',
	null = 'null',
}

export enum SneakerStatus {
	Stocking = 'Stocking',
	Rocking = 'Rocking',
	Selling = 'Selling',
	null = 'null',
}

export type Photo = {
	id?: string;
	uri: string;
	alt?: string;
};

export type SneakerOwner = {
	id: string;
	username: string;
	first_name?: string;
	last_name?: string;
	profile_picture_url?: string;
};

export type Sneaker = {
	id: string;
	model: string;
	price_paid: number;
	brand: SneakerBrand;
	size: number;
	condition: number;
	status: SneakerStatus;
	description: string | null;
	user_id: string;
	created_at: string;
	updated_at: string;
	images: Photo[];
	estimated_value: number;
	owner?: SneakerOwner;
	wishlist_added_at?: string;
	wishlist?: boolean | false;
};
