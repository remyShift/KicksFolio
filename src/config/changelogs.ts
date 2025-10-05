import { VersionChangelog } from '@/types/changelog';

/**
 * Configuration des changelogs par version
 *
 * Exemples d'utilisation :
 * - Icon : icon: 'sparkles'
 * - Image/GIF : image: require('@/assets/images/feature1.png')
 */
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
				// Exemple avec image ou GIF :
				// image: require('@/assets/images/feature1.png'),
				// image: require('@/assets/images/demo.gif'),
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
