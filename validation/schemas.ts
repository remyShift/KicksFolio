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
			.min(1, 'Please upload at least one image.')
			.max(3, 'You can upload a maximum of 3 images.'),
		model: z
			.string()
			.min(2, 'Sneaker model must be at least 2 characters long.')
			.refine(
				(val) =>
					!sneakerBrandOptions.some((option) =>
						val
							.toLowerCase()
							.split(' ')
							.includes(option.value.toLowerCase())
					),
				'A brand name cannot be in the model.'
			),
		brand: z
			.enum(Object.values(SneakerBrand) as [string, ...string[]])
			.transform((val) => val as SneakerBrand),
		status: z
			.enum(Object.values(SneakerStatus) as [string, ...string[]])
			.transform((val) => val as SneakerStatus),
		size: z
			.string()
			.min(1, 'Please enter the size.')
			.transform((val) => val.replace(',', '.'))
			.refine((val) => {
				const num = Number(val);
				return !isNaN(num) && num >= 7 && num <= 15;
			}, 'Size must be a number between 7 and 15.')
			.refine((val) => {
				const num = Number(val);
				return (num * 2) % 1 === 0;
			}, 'Size must be a multiple of 0.5 (e.g., 7, 7.5, 8, 8.5).'),
		condition: z
			.string()
			.min(1, 'Please select a condition.')
			.refine(
				(val) =>
					!isNaN(Number(val)) &&
					Number(val) >= 1 &&
					Number(val) <= 10,
				'Condition must be a number between 1 and 10.'
			),
		price_paid: z
			.string()
			.optional()
			.refine(
				(val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
				'Please enter a valid price.'
			),
		description: z.string().optional(),
	});
};

export const createEditProfileSchema = () => {
	return z.object({
		username: z
			.string()
			.min(4, 'Username must be at least 4 characters long.')
			.max(16, 'Username must be less than 16 characters.')
			.regex(/^\w+$/, 'Username must not contain special characters.'),
		first_name: z
			.string()
			.min(2, 'First name must be at least 2 characters long.')
			.regex(
				/^[a-zA-Z\s]+$/,
				'First name must not contain special characters.'
			),
		last_name: z
			.string()
			.min(2, 'Last name must be at least 2 characters long.')
			.regex(
				/^[a-zA-Z\s]+$/,
				'Last name must not contain special characters.'
			),
		sneaker_size: z
			.string()
			.min(1, 'Sneaker size is required.')
			.transform((val) => val.replace(',', '.'))
			.refine(
				(val) =>
					!isNaN(Number(val)) && Number(val) > 7 && Number(val) < 16,
				'Size must be a number between 7 and 15.'
			)
			.refine((val) => {
				const num = Number(val);
				return (num * 2) % 1 === 0;
			}, 'Size must be a multiple of 0.5 (e.g., 7, 7.5, 8, 8.5).'),
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
