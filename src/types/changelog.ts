import { ImageSourcePropType } from 'react-native';

export interface ChangelogSlide {
	id: string;
	title: string;
	description: string;
	icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
	image?: ImageSourcePropType; // Support PNG, JPG, GIF, etc.
}

export interface VersionChangelog {
	version: string;
	slides: ChangelogSlide[];
}

export interface ChangelogState {
	lastSeenVersion: string | null;
	hasSeenCurrentVersion: boolean;
}
