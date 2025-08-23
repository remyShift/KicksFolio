import { t } from 'i18next';
import { z } from 'zod';

import { useSizeUnitStore } from '@/store/useSizeUnitStore';
import { BrandId, SneakerStatus } from '@/types/sneaker';

import { validateSneakerSize } from './utils';
import { sneakerBrandOptions } from './utils';

export const createSneakerSchema = () => {
	const currentUnit = useSizeUnitStore.getState().currentUnit;

	return z.object({
		images: z
			.array(
				z.object({
					id: z.string().optional(),
					uri: z.string(),
					alt: z.string().optional(),
				})
			)
			.min(1, t('collection.modal.form.errors.images.min'))
			.max(3, t('collection.modal.form.errors.images.max')),
		model: z
			.string()
			.min(2, t('collection.modal.form.errors.model.min'))
			.refine(
				(val) =>
					!sneakerBrandOptions.some((option) =>
						val
							.toLowerCase()
							.split(' ')
							.includes(option.label.toLowerCase())
					),
				t('collection.modal.form.errors.model.brandInModel')
			),
		brand_id: z
			.union([z.string(), z.number()])
			.transform((val) =>
				typeof val === 'string' ? parseInt(val, 10) : val
			)
			.refine(
				(val) => Object.values(BrandId).includes(val),
				'Invalid brand ID'
			),
		status_id: z
			.union([z.string(), z.number()])
			.transform((val) =>
				typeof val === 'string' ? parseInt(val, 10) : val
			)
			.refine(
				(val) =>
					[
						SneakerStatus.ROCKING,
						SneakerStatus.SELLING,
						SneakerStatus.STOCKING,
					].includes(val),
				'Invalid status ID'
			),
		size: z
			.string()
			.min(1, t('collection.modal.form.errors.size.min'))
			.transform((val) => val.replace(',', '.'))
			.refine(
				validateSneakerSize,
				currentUnit === 'EU'
					? t('collection.modal.form.errors.size.eu')
					: t('collection.modal.form.errors.size.us')
			)
			.refine((val) => {
				const num = Number(val);
				return (num * 2) % 1 === 0;
			}, t('collection.modal.form.errors.size.multiple')),
		condition: z
			.string()
			.min(1, t('collection.modal.form.errors.condition.min'))
			.refine(
				(val) =>
					!isNaN(Number(val)) &&
					Number(val) >= 1 &&
					Number(val) <= 10,
				t('collection.modal.form.errors.condition.refine')
			),
		price_paid: z
			.string()
			.optional()
			.refine(
				(val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
				t('collection.modal.form.errors.price_paid.min')
			),
		description: z
			.string()
			.optional()
			.transform((val) => (val ? val.replace(/<[^>]*>/g, '') : val)),
		og_box: z.boolean().optional(),
		ds: z.boolean().optional(),
		is_women: z.boolean().optional(),
	});
};

// Type pour les données de formulaire (avant validation/transformation)
export interface SneakerFormData {
	model: string;
	brand_id: string; // String dans les formulaires
	status_id: string; // String dans les formulaires
	size: string;
	condition: string;
	images: { id?: string; uri: string; alt?: string }[];
	price_paid?: string;
	description?: string;
	og_box?: boolean;
	ds?: boolean;
	is_women?: boolean;
}

// Type pour les données validées (après transformation)
export type ValidatedSneakerData = z.infer<
	ReturnType<typeof createSneakerSchema>
>;
