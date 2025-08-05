import { useSizeUnitStore } from '@/src/store/useSizeUnitStore';
import { SneakerBrand } from '@/types/sneaker';
import { SneakerStatus } from '@/types/sneaker';

export const sneakerStatusOptions = [
	{ label: 'Stocking', value: SneakerStatus.Stocking },
	{ label: 'Rocking', value: SneakerStatus.Rocking },
	{ label: 'Selling', value: SneakerStatus.Selling },
];

export const sneakerBrandOptions: { label: string; value: SneakerBrand }[] = [
	{ label: 'NIKE', value: SneakerBrand.Nike },
	{ label: 'ADIDAS', value: SneakerBrand.Adidas },
	{ label: 'PUMA', value: SneakerBrand.Puma },
	{ label: 'VANS', value: SneakerBrand.Vans },
	{ label: 'CONVERSE', value: SneakerBrand.Converse },
	{ label: 'JORDAN', value: SneakerBrand.Jordan },
	{ label: 'NEW BALANCE', value: SneakerBrand.NewBalance },
	{ label: 'ASICS', value: SneakerBrand.Asics },
	{ label: 'REEBOK', value: SneakerBrand.Reebok },
	{ label: 'OTHER', value: SneakerBrand.Other },
];

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
