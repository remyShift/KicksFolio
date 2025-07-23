import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// Import des traductions anglaises
import enAuth from './en/auth.json';
import enSettings from './en/settings.json';
import enAlert from './en/alert.json';
import enCollection from './en/collection.json';
import enSocial from './en/social.json';
import enNavigation from './en/navigation.json';
import enUi from './en/ui.json';
import enSearch from './en/search.json';

import frAuth from './fr/auth.json';
import frSettings from './fr/settings.json';
import frAlert from './fr/alert.json';
import frCollection from './fr/collection.json';
import frSocial from './fr/social.json';
import frNavigation from './fr/navigation.json';
import frUi from './fr/ui.json';
import frSearch from './fr/search.json';

const resources = {
	en: {
		translation: {
			auth: enAuth,
			settings: enSettings,
			alert: enAlert,
			collection: enCollection,
			social: enSocial,
			navigation: enNavigation,
			ui: enUi,
			search: enSearch,
		},
	},
	fr: {
		translation: {
			auth: frAuth,
			settings: frSettings,
			alert: frAlert,
			collection: frCollection,
			social: frSocial,
			navigation: frNavigation,
			ui: frUi,
			search: frSearch,
		},
	},
};

export const deviceLanguage = getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
	resources,
	lng: 'en',
	fallbackLng: 'en',
	debug: __DEV__,

	interpolation: {
		escapeValue: false,
	},

	react: {
		useSuspense: false,
	},
});

export default i18n;
