import { ImageSourcePropType } from 'react-native';

export interface ChangelogSlide {
	id: string;
	titleKey: string;
	descriptionKey: string;
	image?: ImageSourcePropType;
}

export interface VersionChangelog {
	version: string;
	slides: ChangelogSlide[];
}

export interface ChangelogState {
	lastSeenVersion: string | null;
	hasSeenCurrentVersion: boolean;
}
