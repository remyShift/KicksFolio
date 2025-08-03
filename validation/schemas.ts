import { SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { z } from 'zod';
import { t } from 'i18next';
import { useSizeUnitStore } from '@/store/useSizeUnitStore';

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

export const createSignUpStep1Schema = () => {
	return z
		.object({
			username: z
				.string()
				.min(4, t('auth.form.username.error.size'))
				.max(16, t('auth.form.username.error.size'))
				.regex(/^\w+$/, t('auth.form.username.error.format')),
			email: z.string().email(t('auth.form.email.error.invalid')),
			password: z
				.string()
				.min(8, t('auth.form.password.error.size'))
				.regex(
					/^(?=.*[A-Z])(?=.*\d).+$/,
					t('auth.form.password.error.format')
				),
			confirmPassword: z.string(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t('auth.form.confirmPassword.error.match'),
			path: ['confirmPassword'],
		});
};

const validateSneakerSize = (val: string) => {
	const num = Number(val);
	const currentUnit = useSizeUnitStore.getState().currentUnit;

	if (isNaN(num)) return false;

	if (currentUnit === 'EU') {
		return num >= 35 && num <= 50;
	} else {
		return num >= 3 && num <= 15.5;
	}
};

export const createSignUpStep2Schema = () => {
	return z.object({
		firstName: z
			.string()
			.min(2, t('auth.form.firstName.error.size'))
			.regex(/^[a-zA-Z\s]+$/, t('auth.form.firstName.error.format'))
			.transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
		lastName: z
			.string()
			.min(2, t('auth.form.lastName.error.size'))
			.regex(/^[a-zA-Z\s]+$/, t('auth.form.lastName.error.format'))
			.transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
		size: z
			.string()
			.min(1, t('auth.form.sneakerSize.error.required'))
			.transform((val) => val.replace(',', '.'))
			.refine(
				validateSneakerSize,
				useSizeUnitStore.getState().currentUnit === 'EU'
					? t('auth.form.sneakerSize.error.eu')
					: t('auth.form.sneakerSize.error.us')
			)
			.refine((val) => {
				const num = Number(val);
				return (num * 2) % 1 === 0;
			}, t('auth.form.sneakerSize.error.multiple')),
		profile_picture: z.string().optional(),
	});
};

export const createLoginSchema = () => {
	return z.object({
		email: z.string().email(t('auth.form.email.error.invalid')),
		password: z.string().min(1, t('auth.form.password.error.required')),
	});
};

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
							.includes(option.value.toLowerCase())
					),
				t('collection.modal.form.errors.model.brandInModel')
			),
		brand: z
			.enum(Object.values(SneakerBrand) as [string, ...string[]])
			.transform((val) => val as SneakerBrand),
		status: z
			.enum(Object.values(SneakerStatus) as [string, ...string[]])
			.transform((val) => val as SneakerStatus),
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

export const createEditProfileSchema = () => {
	const currentUnit = useSizeUnitStore.getState().currentUnit;

	return z.object({
		username: z
			.string()
			.min(4, t('auth.form.username.error.size'))
			.max(16, t('auth.form.username.error.size'))
			.regex(/^\w+$/, t('auth.form.username.error.format')),
		first_name: z
			.string()
			.min(2, t('auth.form.firstName.error.size'))
			.regex(/^[a-zA-Z\s]+$/, t('auth.form.firstName.error.format')),
		last_name: z
			.string()
			.min(2, t('auth.form.lastName.error.size'))
			.regex(/^[a-zA-Z\s]+$/, t('auth.form.lastName.error.format')),
		sneaker_size: z
			.string()
			.min(1, t('auth.form.sneakerSize.error.required'))
			.transform((val) => val.replace(',', '.'))
			.refine(
				validateSneakerSize,
				currentUnit === 'EU'
					? t('auth.form.sneakerSize.error.eu')
					: t('auth.form.sneakerSize.error.us')
			)
			.refine((val) => {
				const num = Number(val);
				return (num * 2) % 1 === 0;
			}, t('auth.form.sneakerSize.error.multiple')),
		profile_picture: z.string().optional(),
	});
};

export const createForgotPasswordSchema = () => {
	return z.object({
		email: z.string().email(t('auth.form.email.error.invalid')),
	});
};

export const createResetPasswordSchema = () => {
	return z
		.object({
			password: z
				.string()
				.min(8, t('auth.form.password.error.size'))
				.regex(
					/^(?=.*[A-Z])(?=.*\d).+$/,
					t('auth.form.password.error.format')
				),
			confirmPassword: z
				.string()
				.min(1, t('auth.form.password.error.required')),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t('auth.form.confirmPassword.error.match'),
			path: ['confirmPassword'],
		});
};

export const createBugReportSchema = () => {
	return z.object({
		title: z
			.string()
			.min(5, t('settings.bugReport.fields.title.error.min'))
			.max(100, t('settings.bugReport.fields.title.error.max')),
		description: z
			.string()
			.min(10, t('settings.bugReport.fields.description.error.min'))
			.max(500, t('settings.bugReport.fields.description.error.max')),
		stepsToReproduce: z
			.string()
			.min(10, t('settings.bugReport.fields.stepsToReproduce.error.min'))
			.max(
				500,
				t('settings.bugReport.fields.stepsToReproduce.error.max')
			),
		expectedBehavior: z
			.string()
			.min(10, t('settings.bugReport.fields.expectedBehavior.error.min'))
			.max(
				300,
				t('settings.bugReport.fields.expectedBehavior.error.max')
			),
		actualBehavior: z
			.string()
			.min(10, t('settings.bugReport.fields.actualBehavior.error.min'))
			.max(300, t('settings.bugReport.fields.actualBehavior.error.max')),
		priority: z.enum(['low', 'medium', 'high']),
	});
};

export const createSocialMediaSchema = () => {
	return z.object({
		instagram_username: z
			.string()
			.max(30, t('settings.socialMedia.instagram.error.max'))
			.regex(
				/^[a-zA-Z0-9_.]+$/,
				t('settings.socialMedia.instagram.error.format')
			)
			.optional()
			.or(z.literal('')),
		social_media_visibility: z.boolean(),
	});
};

export type SignUpStep1FormData = z.infer<
	ReturnType<typeof createSignUpStep1Schema>
>;
export type SignUpStep2FormData = z.infer<
	ReturnType<typeof createSignUpStep2Schema>
>;
export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
export type SneakerFormData = z.infer<ReturnType<typeof createSneakerSchema>>;
export type ForgotPasswordFormData = z.infer<
	ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordFormData = z.infer<
	ReturnType<typeof createResetPasswordSchema>
>;
export type EditProfileFormData = z.infer<
	ReturnType<typeof createEditProfileSchema>
>;

export type SocialMediaFormData = z.infer<
	ReturnType<typeof createSocialMediaSchema>
>;
