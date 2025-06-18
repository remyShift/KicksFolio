import { Sneaker } from '@/types/Sneaker';

export const mockSneakers: Sneaker[] = [
	{
		id: '1',
		collection_id: '1',
		price_paid: 100,
		status: 'rocking',
		model: 'Sneaker 1',
		brand: 'Nike',
		size: 10.5,
		images: [
			{
				id: '1',
				url: 'https://example.com/image.jpg',
			},
		],
		description: null,
		condition: 5,
		created_at: '',
		updated_at: '',
	},
];
