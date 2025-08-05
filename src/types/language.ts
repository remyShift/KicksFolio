export type SupportedLanguage = 'en' | 'fr';

export interface Language {
	code: SupportedLanguage;
	name: string;
	nativeName: string;
}

export const supportedLanguages: Language[] = [
	{ code: 'en', name: 'English', nativeName: 'English' },
	{ code: 'fr', name: 'French', nativeName: 'Français' },
];
