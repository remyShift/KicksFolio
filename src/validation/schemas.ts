import { t } from 'i18next';
import { z } from 'zod';

export const createBugReportSchema = () => {
	return z.object({
		title: z
			.string()
			.min(5, t('settings.bugReport.fields.title.error.min'))
			.max(100, t('settings.bugReport.fields.title.error.max')),
		description: z
			.string()
			.min(10, t('settings.bugReport.fields.description.error.min'))
			.max(1000, t('settings.bugReport.fields.description.error.max')),
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

export type SocialMediaFormData = z.infer<
	ReturnType<typeof createSocialMediaSchema>
>;

export type BugReportFormData = z.infer<
	ReturnType<typeof createBugReportSchema>
>;
