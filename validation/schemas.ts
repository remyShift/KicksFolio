import { z } from 'zod';

export const signUpStep1Schema = z
	.object({
		username: z
			.string()
			.min(4, 'Username must be at least 4 characters long.')
			.max(16, 'Username must be less than 16 characters.')
			.regex(/^\w+$/, 'Username must not contain special characters.'),
		email: z.string().email('Please put a valid email.'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters long.')
			.regex(
				/^(?=.*[A-Z])(?=.*\d).+$/,
				'Password must contain at least one uppercase letter and one number.'
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

export const signUpStep2Schema = z.object({
	firstName: z
		.string()
		.min(2, 'Name must be at least 2 characters long.')
		.regex(
			/^[a-zA-Z\s]+$/,
			'Name must not contain special characters or numbers.'
		),
	lastName: z
		.string()
		.min(2, 'Name must be at least 2 characters long.')
		.regex(
			/^[a-zA-Z\s]+$/,
			'Name must not contain special characters or numbers.'
		),
	size: z
		.string()
		.min(1, 'Please enter your sneaker size.')
		.transform((val) => val.replace(',', '.'))
		.refine((val) => {
			const num = Number(val);
			return !isNaN(num) && num >= 7 && num <= 15;
		}, 'Please enter a valid size, size must be a number between 7 and 15.')
		.refine((val) => {
			const num = Number(val);
			return (num * 2) % 1 === 0;
		}, 'Size must be a multiple of 0.5 (e.g., 7, 7.5, 8, 8.5).'),
	profile_picture: z.string().optional(),
});

export const loginSchema = z.object({
	email: z.string().email('Please put a valid email.'),
	password: z.string().min(1, 'Please enter your password.'),
});

export const sneakerSchema = z.object({
	images: z
		.array(z.object({ url: z.string() }))
		.min(1, 'Please upload at least one image.'),
	model: z
		.string()
		.min(2, 'Sneaker model must be at least 2 characters long.')
		.refine(
			(val) =>
				!sneakerBrandOptions.some((option) =>
					val.toLowerCase().includes(option.value.toLowerCase())
				),
			'A brand name cannot be in the model.'
		),
	brand: z
		.string()
		.min(1, 'Please select a brand.')
		.refine(
			(val) => sneakerBrandOptions.some((option) => option.value === val),
			'Please select a valid brand.'
		),
	status: z
		.string()
		.min(1, 'Please select a status.')
		.refine(
			(val) =>
				sneakerStatusOptions.some((option) => option.value === val),
			'Please select a valid status.'
		),
	size: z
		.string()
		.min(1, 'Please enter the size.')
		.transform((val) => val.replace(',', '.'))
		.refine((val) => {
			const num = Number(val);
			return !isNaN(num) && num >= 7 && num <= 15;
		}, 'Please enter a valid size, size must be a number between 7 and 15.')
		.refine((val) => {
			const num = Number(val);
			return (num * 2) % 1 === 0;
		}, 'Size must be a multiple of 0.5 (e.g., 7, 7.5, 8, 8.5).'),
	condition: z
		.string()
		.min(1, 'Please select a condition.')
		.refine(
			(val) =>
				!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10,
			'Please enter a valid condition, condition must be a number between 1 and 10.'
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

export const sneakerStatusOptions = [
	{ label: 'Stocking', value: 'stocking' },
	{ label: 'Rocking', value: 'rocking' },
	{ label: 'Selling', value: 'selling' },
];

export const sneakerBrandOptions = [
	{ label: 'Nike', value: 'nike' },
	{ label: 'Adidas', value: 'adidas' },
	{ label: 'Puma', value: 'puma' },
	{ label: 'Vans', value: 'vans' },
	{ label: 'Converse', value: 'converse' },
	{ label: 'Jordan', value: 'jordan' },
	{ label: 'Yeezy', value: 'yeezy' },
	{ label: 'New Balance', value: 'new_balance' },
	{ label: 'Asics', value: 'asics' },
	{ label: 'Reebok', value: 'reebok' },
];

export const editProfileSchema = z.object({
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
			(val) => !isNaN(Number(val)) && Number(val) > 7 && Number(val) < 16,
			'Please enter a valid size, size must be a number between 7 and 15.'
		)
		.refine((val) => {
			const num = Number(val);
			return (num * 2) % 1 === 0;
		}, 'Size must be a multiple of 0.5 (e.g., 7, 7.5, 8, 8.5).'),
	profile_picture: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email('Please enter a valid email address.'),
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters long.')
			.regex(
				/^(?=.*[A-Z])(?=.*\d).+$/,
				'Password must contain at least one uppercase letter and one number.'
			),
		confirmPassword: z.string().min(1, 'Please confirm your password.'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match.",
		path: ['confirmPassword'],
	});

export type SignUpStep1FormData = z.infer<typeof signUpStep1Schema>;
export type SignUpStep2FormData = z.infer<typeof signUpStep2Schema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SneakerFormData = z.infer<typeof sneakerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
