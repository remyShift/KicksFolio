import { VersionChangelog } from '@/types/changelog';

export const CHANGELOGS: VersionChangelog[] = [
	{
		version: '1.0.5',
		slides: [
			{
				id: 'welcome',
				title: 'Bienvenue sur KicksFolio ! 👋',
				description:
					'Découvrez toutes les nouveautés de cette version.',
				icon: 'sparkles',
			},
			{
				id: 'feature-1',
				title: 'Première fonctionnalité',
				description:
					'Description de votre première grande fonctionnalité.',
				icon: 'rocket',
			},
			{
				id: 'feature-2',
				title: 'Deuxième fonctionnalité',
				description: 'Description de votre deuxième fonctionnalité.',
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
