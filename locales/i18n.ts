import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import enAuth from './en/auth.json';
import enSettings from './en/settings.json';
import enAlert from './en/alert.json';
import enCommon from './en/common.json';

import frAuth from './fr/auth.json';
import frSettings from './fr/settings.json';
import frAlert from './fr/alert.json';
import frCommon from './fr/common.json';

const resources = {
	en: {
		translation: {
			auth: enAuth,
			settings: enSettings,
			alert: enAlert,
			common: enCommon,
		},
	},
	fr: {
		translation: {
			auth: frAuth,
			settings: frSettings,
			alert: frAlert,
			common: frCommon,
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
