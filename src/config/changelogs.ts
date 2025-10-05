import { VersionChangelog } from '@/types/changelog';

export const CHANGELOGS: VersionChangelog[] = [
	{
		version: '1.0.5',
		slides: [
			{
				id: 'feature-1',
				titleKey: 'changelog.105.feature1.title',
				descriptionKey: 'changelog.105.feature1.description',
				image: require('@/assets/images/changelogs/1.gif'),
			},
			{
				id: 'feature-2',
				titleKey: 'changelog.105.feature2.title',
				descriptionKey: 'changelog.105.feature2.description',
				image: require('@/assets/images/changelogs/2.gif'),
			},
			{
				id: 'feature-3',
				titleKey: 'changelog.105.feature3.title',
				descriptionKey: 'changelog.105.feature3.description',
				image: require('@/assets/images/changelogs/3.gif'),
			},
			{
				id: 'feature-4',
				titleKey: 'changelog.105.feature4.title',
				descriptionKey: 'changelog.105.feature4.description',
				image: require('@/assets/images/changelogs/4.gif'),
			},
			{
				id: 'feature-5',
				titleKey: 'changelog.105.feature5.title',
				descriptionKey: 'changelog.105.feature5.description',
				image: require('@/assets/images/changelogs/5.gif'),
			},
			{
				id: 'feature-6',
				titleKey: 'changelog.105.feature6.title',
				descriptionKey: 'changelog.105.feature6.description',
			},
		],
	},
];

export function getCurrentVersionChangelog(
	appVersion: string
): VersionChangelog | undefined {
	return CHANGELOGS.find((changelog) => changelog.version === appVersion);
}
