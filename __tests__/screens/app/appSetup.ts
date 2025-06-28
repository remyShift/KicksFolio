import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/Sneaker';

export const mockSneakers: Sneaker[] = [
	{
		id: '1',
		user_id: '1',
		price_paid: 100,
		status: SneakerStatus.Rocking,
		model: 'Sneaker 1',
		brand: SneakerBrand.Nike,
		size: 10.5,
		images: [
			{
				id: '1',
				uri: 'https://example.com/image.jpg',
			},
		],
		description: null,
		condition: 5,
		created_at: '',
		updated_at: '',
		estimated_value: 120,
	},
];
