import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

export const mockSneakers: Sneaker[] = [
	{
		id: '1',
		user_id: '1',
		price_paid: 100,
		status: SneakerStatus.Rocking,
		model: 'Sneaker 1',
		brand: SneakerBrand.Nike,
		sku: '1234567890',
		size_eu: 45,
		size_us: 10.5,
		condition: 5,
		images: [
			{
				id: '1',
				uri: 'https://example.com/image.jpg',
			},
		],
		description: null,
		created_at: '',
		updated_at: '',
		estimated_value: 120,
	},
];
