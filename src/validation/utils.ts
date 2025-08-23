import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { SneakerBrand } from '@/types/sneaker';
import { SneakerStatus } from '@/types/sneaker';

export const sneakerStatusOptions = [
	{ label: 'Stocking', value: SneakerStatus.STOCKING },
	{ label: 'Rocking', value: SneakerStatus.ROCKING },
	{ label: 'Selling', value: SneakerStatus.SELLING },
];

export const sneakerBrandOptions: { label: string; value: SneakerBrand }[] = [
	{ label: 'Nike', value: SneakerBrand.Nike },
	{ label: 'Adidas', value: SneakerBrand.Adidas },
	{ label: 'Puma', value: SneakerBrand.Puma },
	{ label: 'Vans', value: SneakerBrand.Vans },
	{ label: 'Converse', value: SneakerBrand.Converse },
	{ label: 'Jordan', value: SneakerBrand.Jordan },
	{ label: 'New Balance', value: SneakerBrand.NewBalance },
	{ label: 'Asics', value: SneakerBrand.Asics },
	{ label: 'Reebok', value: SneakerBrand.Reebok },
	{ label: 'Other', value: SneakerBrand.Other },
];

export const brandLogos: Record<string, any> = {
	nike: require('@/assets/images/brands/nike.png'),
	adidas: require('@/assets/images/brands/adidas.png'),
	jordan: require('@/assets/images/brands/jordan.png'),
	'new balance': require('@/assets/images/brands/newbalance.png'),
	asics: require('@/assets/images/brands/asics.png'),
	puma: require('@/assets/images/brands/puma.png'),
	reebok: require('@/assets/images/brands/reebok.png'),
	converse: require('@/assets/images/brands/converse.png'),
	vans: require('@/assets/images/brands/vans.png'),
};

export const validateSneakerSize = (val: string) => {
	const num = Number(val);
	const currentUnit = useSizeUnitStore.getState().currentUnit;

	if (isNaN(num)) return false;

	if (currentUnit === 'EU') {
		return num >= 35 && num <= 50;
	} else {
		return num >= 3 && num <= 15.5;
	}
};
