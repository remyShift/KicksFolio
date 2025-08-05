import AsyncStorage from '@react-native-async-storage/async-storage';

import { create } from 'zustand';

import i18n from '@/src/locales/i18n';
import {
	Language,
	SupportedLanguage,
	supportedLanguages,
} from '@/types/language';

interface LanguageStore {
	currentLanguage: SupportedLanguage;
	isInitialized: boolean;
	supportedLanguages: Language[];

	setLanguage: (language: SupportedLanguage) => Promise<void>;
	initializeLanguage: (deviceLanguage?: string) => Promise<void>;
	getCurrentLanguage: () => SupportedLanguage;
	getSupportedLanguages: () => Language[];
}

const LANGUAGE_STORAGE_KEY = 'app_language';

export const useLanguageStore = create<LanguageStore>((set, get) => ({
	currentLanguage: 'en',
	isInitialized: false,
	supportedLanguages,

	setLanguage: async (language: SupportedLanguage) => {
		i18n.changeLanguage(language)
			.then(() => AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language))
			.then(() => {
				set({
					currentLanguage: language,
				});
				console.log(`✅ Language changed to: ${language}`);
			})
			.catch((error) => {
				console.error('❌ Error changing language:', error);
			});
	},

	initializeLanguage: async (deviceLanguage?: string) => {
		AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
			.then(async (savedLanguage) => {
				let languageToUse: SupportedLanguage;

				if (
					savedLanguage &&
					supportedLanguages.some(
						(lang) => lang.code === savedLanguage
					)
				) {
					languageToUse = savedLanguage as SupportedLanguage;
				} else if (
					deviceLanguage &&
					supportedLanguages.some(
						(lang) => lang.code === deviceLanguage
					)
				) {
					languageToUse = deviceLanguage as SupportedLanguage;
				} else {
					languageToUse = 'en';
				}

				await i18n.changeLanguage(languageToUse);
				return languageToUse;
			})
			.then(async (languageToUse) => {
				set({
					currentLanguage: languageToUse,
					isInitialized: true,
				});
				console.log(`✅ Language initialized to: ${languageToUse}`);
			})
			.catch((error) => {
				console.error('❌ Error initializing language:', error);
				set({
					currentLanguage: 'en',
					isInitialized: true,
				});
			});
	},

	getCurrentLanguage: () => get().currentLanguage,

	getSupportedLanguages: () => get().supportedLanguages,
}));
