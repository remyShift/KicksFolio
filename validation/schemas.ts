import { SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { z } from 'zod';
import { t } from 'i18next';

export const sneakerStatusOptions = [
	{ label: 'Stocking', value: SneakerStatus.Stocking },
	{ label: 'Rocking', value: SneakerStatus.Rocking },
	{ label: 'Selling', value: SneakerStatus.Selling },
];

export const sneakerBrandOptions: { label: string; value: SneakerBrand }[] = [
	{ label: 'Nike', value: SneakerBrand.Nike },
	{ label: 'Adidas', value: SneakerBrand.Adidas },
	{ label: 'Puma', value: SneakerBrand.Puma },
	{ label: 'Vans', value: SneakerBrand.Vans },
	{ label: 'Converse', value: SneakerBrand.Converse },
	{ label: 'Jordan', value: SneakerBrand.Jordan },
	{ label: 'Yeezy', value: SneakerBrand.Yeezy },
	{ label: 'New Balance', value: SneakerBrand.NewBalance },
	{ label: 'Asics', value: SneakerBrand.Asics },
	{ label: 'Reebok', value: SneakerBrand.Reebok },
	{ label: 'Other', value: SneakerBrand.Other },
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
			.refine((val) => {
				const num = Number(val);
				if (isNaN(num)) return false;
				return (num >= 7 && num <= 15) || (num >= 35 && num <= 48);
			}, t('auth.form.sneakerSize.error.size'))
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
			.refine((val) => {
				const num = Number(val);
				return (
					(!isNaN(num) && num >= 7 && num <= 15) ||
					(num >= 35 && num <= 48)
				);
			}, t('collection.modal.form.errors.size.refine'))
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
		description: z.string().optional(),
	});
};

export const createEditProfileSchema = () => {
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
			.refine((val) => {
				const num = Number(val);
				if (isNaN(num)) return false;
				return (num >= 7 && num <= 15) || (num >= 35 && num <= 48);
			}, t('auth.form.sneakerSize.error.size'))
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
