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
}

export type Photo = {
	id?: string;
	uri: string;
	alt?: string;
};

export type Sneaker = {
	id: string;
	model: string;
	price_paid: number;
	brand: SneakerBrand;
	size: number;
	condition: number;
	status: string;
	description: string | null;
	collection_id: string;
	created_at: string;
	updated_at: string;
	images: Photo[];
};
