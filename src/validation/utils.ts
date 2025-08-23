import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import {
	BrandId,
	getBrandIdByName as getBrandIdByNameFromTypes,
} from '@/types/sneaker';
import { SneakerStatus } from '@/types/sneaker';

export const getBrandIdByName = getBrandIdByNameFromTypes;

export const sneakerStatusOptions = [
	{ label: 'Stocking', value: SneakerStatus.STOCKING.toString() },
	{ label: 'Rocking', value: SneakerStatus.ROCKING.toString() },
	{ label: 'Selling', value: SneakerStatus.SELLING.toString() },
];

export const sneakerBrandOptions: { label: string; value: string }[] = [
	{ label: 'Nike', value: BrandId.Nike.toString() },
	{ label: 'Adidas', value: BrandId.Adidas.toString() },
	{ label: 'Puma', value: BrandId.Puma.toString() },
	{ label: 'Vans', value: BrandId.Vans.toString() },
	{ label: 'Converse', value: BrandId.Converse.toString() },
	{ label: 'Jordan', value: BrandId.Jordan.toString() },
	{ label: 'New Balance', value: BrandId.NewBalance.toString() },
	{ label: 'Asics', value: BrandId.Asics.toString() },
	{ label: 'Reebok', value: BrandId.Reebok.toString() },
	{ label: 'Other', value: BrandId.Other.toString() },
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
