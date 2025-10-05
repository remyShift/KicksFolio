import i18n from '@/locales/i18n';
import { VersionChangelog } from '@/types/changelog';

export const CHANGELOGS: VersionChangelog[] = [
	{
		version: '1.0.5',
		slides: [
			{
				id: 'feature-1',
				title: i18n.t('changelog.105.feature1.title'),
				description: i18n.t('changelog.105.feature1.description'),
				image: require('@/assets/images/changelogs/1.gif'),
			},
			{
				id: 'feature-2',
				title: i18n.t('changelog.105.feature2.title'),
				description: i18n.t('changelog.105.feature2.description'),
				image: require('@/assets/images/changelogs/2.gif'),
			},
			{
				id: 'feature-3',
				title: i18n.t('changelog.105.feature3.title'),
				description: i18n.t('changelog.105.feature3.description'),
				image: require('@/assets/images/changelogs/3.gif'),
			},
			{
				id: 'feature-4',
				title: i18n.t('changelog.105.feature4.title'),
				description: i18n.t('changelog.105.feature4.description'),
				image: require('@/assets/images/changelogs/4.gif'),
			},
			{
				id: 'feature-5',
				title: i18n.t('changelog.105.feature5.title'),
				description: i18n.t('changelog.105.feature5.description'),
				image: require('@/assets/images/changelogs/5.gif'),
			},
			{
				id: 'feature-6',
				title: i18n.t('changelog.105.feature6.title'),
				description: i18n.t('changelog.105.feature6.description'),
			},
		],
	},
];

export function getCurrentVersionChangelog(
	appVersion: string
): VersionChangelog | undefined {
	return CHANGELOGS.find((changelog) => changelog.version === appVersion);
}
