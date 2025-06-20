import { Sneaker } from '@/types/Sneaker';
import { FetchedSneaker } from '@/store/useModalStore';

export const mockSneaker: Sneaker = {
	id: '1',
	collection_id: '1',
	price_paid: 150,
	status: 'rocking',
	model: 'Air Max 1',
	brand: 'Nike',
	size: 10.5,
	images: [
		{
			id: '1',
			url: 'https://example.com/sneaker.jpg',
		},
	],
	description: 'A classic sneaker',
	condition: 9,
	created_at: '2024-01-01',
	updated_at: '2024-01-01',
};

export const mockFetchedSneaker: FetchedSneaker = {
	model: 'Air Max 1 x Patta',
	brand: 'Nike',
	description: 'Limited edition collaboration',
	image: {
		url: 'https://example.com/fetched-sneaker.jpg',
	},
};
