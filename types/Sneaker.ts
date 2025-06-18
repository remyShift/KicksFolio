export type SneakerBrand =
	| 'Nike'
	| 'Adidas'
	| 'Converse'
	| 'New Balance'
	| 'Puma'
	| 'Jordan'
	| 'Yeezy'
	| 'Asics'
	| 'Reebok'
	| 'Vans';

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
	images: {
		id: string;
		url: string;
	}[];
};
