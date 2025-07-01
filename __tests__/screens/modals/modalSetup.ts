import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { FetchedSneaker } from '@/store/useModalStore';

export const mockSneaker: Sneaker = {
	id: '1',
	user_id: '1',
	price_paid: 150,
	status: SneakerStatus.Rocking,
	model: 'Air Max 1',
	brand: SneakerBrand.Nike,
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
	created_at: '2024-01-01',
	updated_at: '2024-01-01',
	estimated_value: 200,
};

export const mockFetchedSneaker: FetchedSneaker = {
	model: 'Air Max 1 x Patta',
	brand: SneakerBrand.Nike,
	estimated_value: 200,
	sku: '1234567890',
	description: 'Limited edition collaboration',
	image: {
		uri: 'https://example.com/fetched-sneaker.jpg',
	},
};
