import { FetchedSneaker } from '@/store/useModalStore';
import { BrandId, Sneaker, SneakerStatus } from '@/types/sneaker';

export const mockSneaker: Sneaker = {
	id: '1',
	user_id: '1',
	price_paid: 150,
	status_id: SneakerStatus.ROCKING,
	model: 'Air Max 1',
	brand_id: BrandId.Nike,
	size_eu: 45,
	size_us: 10.5,
	images: [
		{
			id: '1',
			uri: 'https://example.com/sneaker.jpg',
		},
	],
	description: 'A classic sneaker',
	condition: 9,
	estimated_value: 200,
};

export const mockFetchedSneaker: FetchedSneaker = {
	model: 'Air Max 1 x Patta',
	brand: 'Nike',
	estimated_value: 200,
	sku: '1234567890',
	description: 'Limited edition collaboration',
	image: {
		uri: 'https://example.com/fetched-sneaker.jpg',
	},
};
