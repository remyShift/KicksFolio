import { t } from 'i18next';
import { z } from 'zod';

import { useSizeUnitStore } from '@/store/useSizeUnitStore';

import { validateSneakerSize } from './utils';

export const createSignUpStep1Schema = () => {
	return z
		.object({
			username: z
				.string()
				.min(3, t('auth.form.username.error.size'))
				.max(12, t('auth.form.username.error.size'))
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

export const createEditProfileSchema = () => {
	const currentUnit = useSizeUnitStore.getState().currentUnit;

	return z.object({
		username: z
			.string()
			.min(3, t('auth.form.username.error.size'))
			.max(12, t('auth.form.username.error.size'))
			.regex(/^\w+$/, t('auth.form.username.error.format')),
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

export const createOAuthCompletionSchema = () => {
	const currentUnit = useSizeUnitStore.getState().currentUnit;

	return z.object({
		username: z
			.string()
			.min(3, t('auth.form.username.error.size'))
			.max(12, t('auth.form.username.error.size'))
			.regex(/^\w+$/, t('auth.form.username.error.format')),
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

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export type SignUpStep1FormData = z.infer<
	ReturnType<typeof createSignUpStep1Schema>
>;

export type SignUpStep2FormData = z.infer<
	ReturnType<typeof createSignUpStep2Schema>
>;

export type EditProfileFormData = z.infer<
	ReturnType<typeof createEditProfileSchema>
>;

export type ForgotPasswordFormData = z.infer<
	ReturnType<typeof createForgotPasswordSchema>
>;

export type ResetPasswordFormData = z.infer<
	ReturnType<typeof createResetPasswordSchema>
>;

export type OAuthCompletionFormData = z.infer<
	ReturnType<typeof createOAuthCompletionSchema>
>;
