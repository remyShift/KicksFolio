import i18n from '@/locales/i18n';
import { VersionChangelog } from '@/types/changelog';

export const CHANGELOGS: VersionChangelog[] = [
	{
		version: '1.0.5',
		slides: [
			{
				id: 'feature-1',
				title: i18n.t('changelog.feature1.title'),
				description: i18n.t('changelog.105.feature1.description'),
				icon: 'sparkles',
				image: require('@/assets/images/changelogs/1.gif'),
			},
			{
				id: 'feature-2',
				title: i18n.t('changelog.105.feature2.title'),
				description: i18n.t('changelog.feature2.description'),
				icon: 'rocket',
				image: require('@/assets/images/changelogs/2.gif'),
			},
			{
				id: 'feature-3',
				title: i18n.t('changelog.105.feature3.title'),
				description: i18n.t('changelog.feature3.description'),
				icon: 'heart',
				image: require('@/assets/images/changelogs/3.gif'),
			},
			{
				id: 'feature-4',
				title: i18n.t('changelog.105.feature4.title'),
				description: i18n.t('changelog.feature4.description'),
				icon: 'heart',
				image: require('@/assets/images/changelogs/4.gif'),
			},
			{
				id: 'feature-5',
				title: i18n.t('changelog.105.feature5.title'),
				description: i18n.t('changelog.feature5.description'),
				icon: 'heart',
				image: require('@/assets/images/changelogs/5.gif'),
			},
			{
				id: 'feature-6',
				title: i18n.t('changelog.105.feature6.title'),
				description: i18n.t('changelog.feature6.description'),
				icon: 'heart',
			},
		],
	},
];

export function getCurrentVersionChangelog(
	appVersion: string
): VersionChangelog | undefined {
	return CHANGELOGS.find((changelog) => changelog.version === appVersion);
}
