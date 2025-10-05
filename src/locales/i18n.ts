import { initReactI18next } from 'react-i18next';

import { getLocales } from 'expo-localization';

import i18n from 'i18next';

import enAlert from './en/alert.json';
import enAuth from './en/auth.json';
import enChangelog from './en/changelog.json';
import enCollection from './en/collection.json';
import enNavigation from './en/navigation.json';
import enSearch from './en/search.json';
import enSettings from './en/settings.json';
import enShare from './en/share.json';
import enSocial from './en/social.json';
import enUi from './en/ui.json';
import frAlert from './fr/alert.json';
import frAuth from './fr/auth.json';
import frChangelog from './fr/changelog.json';
import frCollection from './fr/collection.json';
import frNavigation from './fr/navigation.json';
import frSearch from './fr/search.json';
import frSettings from './fr/settings.json';
import frShare from './fr/share.json';
import frSocial from './fr/social.json';
import frUi from './fr/ui.json';

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
			share: enShare,
			changelog: enChangelog,
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
			share: frShare,
			changelog: frChangelog,
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
